use yew::prelude::*;

pub struct ConnectArea {
    link: ComponentLink<Self>,
    address: String,
    connected: bool,
    on_connect: Callback<String>,
    on_disconnect: Callback<()>,
}

pub enum Msg {
    Connect,
    Disconnect,
    UpdateAddress(String),
}

#[derive(Clone, PartialEq, Properties)]
pub struct Props {
    pub connected: bool,
    pub on_connect: Callback<String>,
    pub on_disconnect: Callback<()>,
}

impl Component for ConnectArea {
    type Message = Msg;
    type Properties = Props;

    fn create(props: Self::Properties, link: ComponentLink<Self>) -> Self {
        Self {
            link,
            connected: props.connected,
            address: String::new(),
            on_connect: props.on_connect,
            on_disconnect: props.on_disconnect,
        }
    }

    fn update(&mut self, msg: Self::Message) -> ShouldRender {
        match msg {
            Msg::Connect => self.on_connect.emit(self.address.clone()),
            Msg::Disconnect => self.on_disconnect.emit(()),
            Msg::UpdateAddress(addr) => self.address.clone_from(&addr),
        }
        true
    }

    fn change(&mut self, props: Self::Properties) -> ShouldRender {
        if props.connected != self.connected {
            self.connected = props.connected;
            return true;
        }
        false
    }

    fn view(&self) -> Html {
        if self.connected {
            html! {
                <div>
                    <span>{ "Connected to" } { &self.address }</span>
                    <button onclick=self.link.callback(|_| Msg::Disconnect)>{ "Disconnect" }</button>
                </div>
            }
        } else {
            html! {
                <div>
                    <input type="text"
                        placeholder="Address"
                        value={ &self.address }
                        oninput=self.link.callback(|e: InputData| Msg::UpdateAddress(e.value)) />
                    <button onclick=self.link.callback(|_| Msg::Connect)>{ "Connect" }</button>
                </div>
            }
        }
    }
}