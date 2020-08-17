use yew::prelude::*;
use web_sys::{HtmlCanvasElement, CanvasRenderingContext2d, MouseEvent};
use wasm_bindgen::{JsValue, JsCast};

const NO_CANVAS: &str = "Oops! Looks like your browser does not support the Canvas element.";

pub struct DrawArea {
    link: ComponentLink<Self>,
    props: Props,

    node_ref: NodeRef,
    canvas: Option<HtmlCanvasElement>,
    ctx: Option<CanvasRenderingContext2d>,

    drawing: bool,
    x: i32,
    y: i32,
}

pub enum Msg {
    MouseDown { x: i32, y: i32 },
    MouseMove { x: i32, y: i32 },
    MouseUp { x: i32, y: i32 },
    ClearCanvas,
}

#[derive(Clone, PartialEq, Properties)]
pub struct Props {
    pub width: f64,
    pub height: f64,
}

impl Component for DrawArea {
    type Message = Msg;
    type Properties = Props;

    fn create(props: Self::Properties, link: ComponentLink<Self>) -> Self {
        Self {
            link,
            props,
            node_ref: NodeRef::default(),
            canvas: None,
            ctx: None,
            drawing: false,
            x: 0,
            y: 0,
        }
    }

    fn rendered(&mut self, _first_render: bool) {
        let canvas = self.node_ref.cast::<HtmlCanvasElement>().unwrap();

        let ctx: CanvasRenderingContext2d = canvas
            .get_context("2d")
            .unwrap()
            .unwrap()
            .dyn_into()
            .unwrap();

        self.canvas = Some(canvas);
        self.ctx = Some(ctx);

        self.clear_canvas();
    }

    fn update(&mut self, msg: Self::Message) -> ShouldRender {
        match msg {
            Msg::MouseDown { x, y } => {
                self.drawing = true;
                self.x = x;
                self.y = y;
            }
            Msg::MouseMove { x, y } => {
                if self.drawing {
                    self.draw_line(self.x, self.y, x, y);
                    self.x = x;
                    self.y = y;
                }
            }
            Msg::MouseUp { x, y } => {
                if self.drawing {
                    self.draw_line(self.x, self.y, x, y);
                    self.drawing = false;
                    self.x = 0;
                    self.y = 0;
                }
            }
            Msg::ClearCanvas => self.clear_canvas()
        }
        false
    }

    fn change(&mut self, props: Self::Properties) -> ShouldRender {
        if props != self.props {
            self.props = props;
            return true;
        }
        false
    }

    fn view(&self) -> Html {
        let mousedown = self.link.callback(|e: MouseEvent| Msg::MouseDown { x: e.offset_x(), y: e.offset_y() });
        let mousemove = self.link.callback(|e: MouseEvent| Msg::MouseMove { x: e.offset_x(), y: e.offset_y() });
        let mouseup = self.link.callback(|e: MouseEvent| Msg::MouseUp { x: e.offset_x(), y: e.offset_y() });
        let clear = self.link.callback(|_| Msg::ClearCanvas);
        html! {
            <div id="draw-area">
                <div>
                    <input type="button"
                        value="Clear"
                        onclick=clear />
                </div>
                <canvas ref={self.node_ref.clone()}
                    id="draw-canvas"
                    width=self.props.width
                    height=self.props.height
                    onmousedown=mousedown
                    onmousemove=mousemove
                    onmouseup=mouseup>
                    { NO_CANVAS }
                </canvas>
            </div>
        }
    }
}

impl DrawArea {
    fn clear_canvas(&self) {
        if let Some(ref ctx) = self.ctx {
            ctx.clear_rect(0.0, 0.0, self.props.width, self.props.height);
            ctx.set_fill_style(&JsValue::from_str("white"));
            ctx.fill_rect(0.0, 0.0, self.props.width, self.props.height);
        }
    }

    fn draw_line(&self, x1: i32, y1: i32, x2: i32, y2: i32) {
        if let Some(ref ctx) = self.ctx {
            ctx.begin_path();
            ctx.set_stroke_style(&JsValue::from_str("black"));
            ctx.set_line_width(2.0);
            ctx.move_to(f64::from(x1), f64::from(y1));
            ctx.line_to(f64::from(x2), f64::from(y2));
            ctx.stroke();
            ctx.close_path();
        }
    }
}