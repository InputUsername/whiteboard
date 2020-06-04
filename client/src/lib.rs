mod connect;

use connect::ConnectArea;

use wasm_bindgen::prelude::*;
use yew::prelude::*;
use yew::services::websocket::{WebSocketService, WebSocketTask, WebSocketStatus};
use yew::format::{Text, Binary};

use std::convert::From;

struct Model {
    link: ComponentLink<Self>,
    ws_service: WebSocketService,
    ws: Option<WebSocketTask>,
}

enum Msg {
    Connect(String),
    Disconnect,
    WsMsg,
    WsOpened,
    WsClosed,
    WsError,
}

fn alert(s: &str) {
    web_sys::window()
        .expect("window not available")
        .alert_with_message(s)
        .expect("alert failed");
}

struct IgnoreData;

impl From<Text> for IgnoreData {
    fn from(_data: Text) -> Self {
        IgnoreData
    }
}

impl From<Binary> for IgnoreData {
    fn from(_data: Binary) -> Self {
        IgnoreData
    }
}

impl Component for Model {
    type Message = Msg;
    type Properties = ();

    fn create(_props: Self::Properties, link: ComponentLink<Self>) -> Self {
        Self {
            link,
            ws_service: WebSocketService::new(),
            ws: None,
        }
    }

    fn update(&mut self, msg: Self::Message) -> ShouldRender {
        match msg {
            Msg::Connect(addr) => {
                let callback = self.link.callback(|_data: IgnoreData| Msg::WsMsg);
                let notification = self.link.callback(|status| match status {
                    WebSocketStatus::Opened => Msg::WsOpened,
                    WebSocketStatus::Closed => Msg::WsClosed,
                    WebSocketStatus::Error => Msg::WsError,
                });
                let task = self
                    .ws_service
                    .connect(&format!("ws://{}", addr), callback, notification)
                    .unwrap();
                self.ws = Some(task);
            }
            Msg::Disconnect => self.ws = None,
            Msg::WsMsg => alert("Message received"),
            Msg::WsOpened => alert("Opened"),
            Msg::WsClosed => {
                alert("Closed");
                self.ws = None;
            }
            Msg::WsError => {
                alert("Error");
                self.ws = None;
            }
        }
        true
    }

    fn change(&mut self, _props: Self::Properties) -> ShouldRender {
        false
    }

    fn view(&self) -> Html {
        html! {
            <ConnectArea connected={ self.ws.is_some() }
                on_connect=self.link.callback(|addr| Msg::Connect(addr))
                on_disconnect=self.link.callback(|_| Msg::Disconnect) />
        }
    }
}

#[wasm_bindgen(start)]
pub fn run_app() {
    console_error_panic_hook::set_once();

    App::<Model>::new().mount_to_body();
}