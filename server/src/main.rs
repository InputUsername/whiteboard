use std::{
    net::SocketAddr,
    sync::Arc,
};

use futures::{
    channel::mpsc::{unbounded, UnboundedSender},
    future, pin_mut,
    stream::TryStreamExt,
    StreamExt,
};

use tokio::net::{TcpListener, TcpStream};
use tungstenite::protocol::Message;

use dashmap::DashMap;

type Tx = UnboundedSender<Message>;
type PeerMap = Arc<DashMap<SocketAddr, Tx>>;

async fn handle_connection(peer_map: PeerMap, raw_stream: TcpStream, addr: SocketAddr) {
    println!("Incoming TCP connection from {}", addr);

    let ws_stream = tokio_tungstenite::accept_async(raw_stream)
        .await
        .expect("Error during websocket handshake");

    // tx is a channel where we can write to send messages to this client;
    // rx is a channel where we can read messages that should be sent to the client.
    let (tx, rx) = unbounded();
    peer_map.insert(addr, tx);

    let (outgoing, incoming) = ws_stream.split();

    // broadcast all incoming messages from this client to the other clients
    let broadcast_incoming = incoming.try_for_each(|msg| {
        let recipients = peer_map
            .iter()
            .filter(|peer_ref| peer_ref.key() != &addr);

        for recp in recipients {
            recp.unbounded_send(msg.clone()).unwrap();
        }

        future::ok(())
    });

    // actually send all messages that should be sent to the client
    let receive_from_others = rx.map(Ok).forward(outgoing);

    pin_mut!(broadcast_incoming, receive_from_others);
    future::select(broadcast_incoming, receive_from_others).await;

    println!("{} disconnected", addr);
    peer_map.remove(&addr);
}

#[tokio::main]
async fn main() {
    let addr = std::env::args()
        .nth(1)
        .unwrap_or_else(|| "127.0.0.1:8080".to_string());
    
    let peers = Arc::new(DashMap::new());

    let mut listener = TcpListener::bind(&addr).await.unwrap();

    println!("Listening on {}", addr);

    while let Ok((stream, addr)) = listener.accept().await {
        tokio::spawn(handle_connection(peers.clone(), stream, addr));
    }
}
