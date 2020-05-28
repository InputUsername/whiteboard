use wasm_bindgen::prelude::*;
use yew::prelude::*;
use yew::services::websocket::{WebSocketService, WebSocketTask, WebSocketStatus};
use yew::format::{Text, Binary};

use std::panic;
use std::convert::From;

struct Model {
    link: ComponentLink<Self>,
    ws_service: WebSocketService,
    ws: Option<WebSocketTask>,
}

enum Msg {
    Connect,
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

    fn create(_: Self::Properties, link: ComponentLink<Self>) -> Self {
        Self {
            link,
            ws_service: WebSocketService::new(),
            ws: None,
        }
    }

    fn update(&mut self, msg: Self::Message) -> ShouldRender {
        match msg {
            Msg::Connect => {
                alert("Clicked connect");

                let callback = self.link.callback(|_data: IgnoreData| Msg::WsMsg);
                let notification = self.link.callback(|status| match status {
                    WebSocketStatus::Opened => Msg::WsOpened,
                    WebSocketStatus::Closed => Msg::WsClosed,
                    WebSocketStatus::Error => Msg::WsError,
                });
                let task = self
                    .ws_service
                    .connect("ws://localhost:8080", callback, notification)
                    .unwrap();
                self.ws = Some(task);
            }
            Msg::WsMsg => return false,
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
            <div>
                <button onclick=self.link.callback(|_| Msg::Connect)>{ "Connect" }</button>
            </div>
        }
    }
}

#[wasm_bindgen(start)]
pub fn run_app() {
    panic::set_hook(Box::new(console_error_panic_hook::hook));

    App::<Model>::new().mount_to_body();
}