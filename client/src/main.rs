use std::convert::From;

use yew::prelude::*;
use yew::services::websocket::{WebSocketService, WebSocketStatus};
use yew::format::{Text, Binary};

use stdweb::web::alert;

struct App {
    link: ComponentLink<Self>,
    websocket: WebSocketService,
}

enum Msg {
    Connect,
    WsStatus(WebSocketStatus),
    WsMessage,
}

enum WhiteboardMessage {
    Unknown,
}

impl From<Text> for WhiteboardMessage {
    fn from(_: Text) -> Self {
        WhiteboardMessage::Unknown
    }
}

impl From<Binary> for WhiteboardMessage {
    fn from(_: Binary) -> Self {
        WhiteboardMessage::Unknown
    }
}

impl Component for App {
    type Message = Msg;
    type Properties = ();

    fn create(_: Self::Properties, link: ComponentLink<Self>) -> Self {
        let websocket = WebSocketService::new();

        Self {
            link,
            websocket,
        }
    }

    fn update(&mut self, msg: Self::Message) -> ShouldRender {
        match msg {
            Msg::Connect => {
                let message = self.link.callback(|_: WhiteboardMessage| Msg::WsMessage);
                let notification = self.link.callback(|status: WebSocketStatus| Msg::WsStatus(status));
                match self.websocket.connect("ws://127.0.0.1:8080", message, notification) {
                    Ok(_ws_task) => {}
                    Err(err) => alert(err),
                }
            }
            Msg::WsStatus(status) => {
                match status {
                    WebSocketStatus::Opened => alert("Connected!"),
                    WebSocketStatus::Closed => alert("Disconnected!"),
                    WebSocketStatus::Error => alert("Failed to connect!"),
                }
            }
            Msg::WsMessage => {
                alert("Got a message!");
            }
        }
        true
    }

    fn view(&self) -> Html {
        let onclick = self.link.callback(|_| Msg::Connect);
        html! {
            <>
                <button onclick=onclick>{ "Connect" }</button>
            </>
        }
    }
}

fn main() {
    yew::start_app::<App>();
}
