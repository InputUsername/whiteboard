// Select elements
var $connection = document.getElementById("connection");
var $host = document.getElementById("host");
var $port = document.getElementById("port");
var $connect = document.getElementById("connect");

var $canvas = document.getElementById("canvas");

var showInterface = function(showCanvas) {
    if (showCanvas == false) {
        $canvas.style.display = "none";
        $connection.style.display = "block";
    }
    else {
        $canvas.style.display = "inline-block";
        $connection.style.display = "none";
    }
};

showInterface(false);

// Connection stuff
var makeUrl = function(host, port) {
    return "ws://" + host + ":" + port + "/whiteboard";
};

socket = null;

// Canvas stuff
if (!$canvas.getContext || !window.WebSocket) {
    var body = document.getElementsByTagName("body");
    body[0].innerHTML = "<p>Oops! Your browser doesn't support canvas or WebSockets!</p>";
}

var CW = 1280;
var CH = 720;

$canvas.width = CW;
$canvas.height = CH;

var ctx = $canvas.getContext('2d');

ctx.clearRect(0, 0, $canvas.width, $canvas.height);

ctx.fillStyle = "#ffffff";
ctx.fillRect(0, 0, $canvas.width, $canvas.height);

var clearCanvas = function() {
    ctx.clearRect(0, 0, $canvas.width, $canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, $canvas.width, $canvas.height);
};

var painting = false;

var drawQueue = [];
var lineQueue = [];

var paint = function(x, y, isLine) {
    drawQueue.push([x, y]);
    lineQueue.push(isLine);
}

var update = function() {
    ctx.strokeStyle = "#000000";
    ctx.lineJoin = "round";
    ctx.lineWidth = 3;

    var length = drawQueue.length;
    for (var i = 0; i < length; i++) {

        ctx.beginPath();

        if (lineQueue[i] && i != 0) {
            ctx.moveTo(drawQueue[i - 1][0], drawQueue[i - 1][1]);

            socket.send(
                "l_" +
                drawQueue[i - 1][0]
                + "_" +
                drawQueue[i - 1][1]
                + "_" +
                drawQueue[i][0]
                + "_" +
                drawQueue[i][1]
                + "_0"
            );
        }
        else {
            ctx.moveTo(drawQueue[i][0] - 1, drawQueue[i][1]);

            socket.send("p_" + drawQueue[i][0] + "_" + drawQueue[i][1] + "_0");
        }

        ctx.lineTo(drawQueue[i][0], drawQueue[i][1]);
        ctx.closePath();
        ctx.stroke();

    }
}

$canvas.addEventListener("mousedown", function(event) {

    painting = true;

    var mouseX, mouseY;
    mouseX = event.pageX - this.offsetLeft;
    mouseY = event.pageY - this.offsetTop;

    paint(mouseX, mouseY, false);
    update();

}, false);

$canvas.addEventListener("mousemove", function(event) {

    if (painting) {
        var mouseX, mouseY;
        mouseX = event.pageX - this.offsetLeft;
        mouseY = event.pageY - this.offsetTop;

        paint(mouseX, mouseY, true);
        update();
    }
    else {
        if (drawQueue.length != 0) drawQueue = [];
        if (lineQueue.length != 0) lineQueue = [];
    }

}, false);

$canvas.addEventListener("mouseup", function(event) {

    painting = false;

}, false);

// Connection stuff
var connect = function() {

    var host = $host.value;
    var port = $port.value;

    var url = makeUrl(host, port);

    try {
        socket = new WebSocket(url);

        socket.onopen = function() {
            console.log("connected to " + url);

            showInterface(true);
        }

        socket.onmessage = function(msg) {
            var cmd = msg.data;

            var paintRegex = /p_\d+_\d+_\d+/g;
            var lineRegex = /l_\d+_\d+_\d+_\d+_\d+/g;

            if (paintRegex.test(cmd)) {
                var data = cmd.split("_");
                if (data.length == 4) {
                    var x = parseInt(data[1]);
                    var y = parseInt(data[2]);
                    var c = parseInt(data[3]);

                    ctx.strokeStyle = "#000000";
                    ctx.lineJoin = "round";
                    ctx.lineWidth = 3;

                    ctx.beginPath();
                    ctx.moveTo(x - 1, y);
                    ctx.lineTo(x, y);
                    ctx.closePath();
                    ctx.stroke();
                }
            }
            else if (lineRegex.test(cmd)) {
                var data = cmd.split("_")
                if (data.length == 6) {
                    var x1 = parseInt(data[1]);
                    var y1 = parseInt(data[2]);
                    var x2 = parseInt(data[3]);
                    var y2 = parseInt(data[4]);
                    var c = parseInt(data[5]);

                    ctx.strokeStyle = "#000000";
                    ctx.lineJoin = "round";
                    ctx.lineWidth = 3;

                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.closePath();
                    ctx.stroke();
                }
            }
            else if (cmd == "c") {
                clearCanvas();
            }
        }

        socket.onerror = function(error) {
            console.log("error:");
            console.log(error);

            alert("error");
        }

        socket.onclose = function() {
            console.log("connection closed");

            reset();
        }
    }
    catch (error) {
        console.log("can't connect to " + url);

        reset();
    }

};

$connect.addEventListener("click", connect, false);

// General stuff
var reset = function() {
    clearCanvas();
    showInterface(false);
    socket = null;

    drawQueue = [];
    lineQueue = [];
};
