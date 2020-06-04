use yew::prelude::*;

const NO_CANVAS: &str = "Oops! Looks like your browser does not support the Canvas element.";

pub struct DrawArea {
    link: ComponentLink<Self>,
}

impl Component for DrawArea {
    type Message = ();
    type Properties = ();

    fn create(_props: Self::Properties, link: ComponentLink<Self>) -> Self {
        Self {
            link,
        }
    }

    fn update(&mut self, _msg: Self::Message) -> ShouldRender {
        false
    }

    fn change(&mut self, _props: Self::Properties) -> ShouldRender {
        false
    }

    fn view(&self) -> Html {
        html! {
            <canvas id="draw-canvas" width=1280 height=720>{ NO_CANVAS }</canvas>
        }
    }
}