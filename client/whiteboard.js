// Select elements
var $aboutArea = document.getElementById("aboutArea")

var $connectArea = document.getElementById("connectArea");
var $host = document.getElementById("host");
var $port = document.getElementById("port");
var $connect = document.getElementById("connect");

var $drawArea = document.getElementById("drawArea");
var $clear = document.getElementById("clear");
var $color = document.getElementById("color");
var $size = document.getElementById("size");
var $canvas = document.getElementById("canvas");
var $usersCount = document.getElementById("usersCount");
var $disconnect = document.getElementById("disconnect");

var showInterface = function(showDrawArea) {
    if (showDrawArea == false) {
        $aboutArea.style.display = "block";
        $connectArea.style.display = "block";
        $drawArea.style.display = "none";
    }
    else {
        $aboutArea.style.display = "none";
        $connectArea.style.display = "none";
        $drawArea.style.display = "block";
    }
};

showInterface(false);

var getColor = function() {
    return $color.value;
}

$clear.addEventListener("click", function() {
    clearCanvas();
    socket.send("c");
}, false);

var getSize = function() {
    return parseInt($size.value);
}

$disconnect.addEventListener("click", function() {
    reset();
}, false);

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
    ctx.strokeStyle = getColor();
    ctx.lineJoin = "round";
    ctx.lineWidth = getSize();

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
                + "_" +
                getColor()
                + "_" +
                getSize()
            );
        }
        else {
            ctx.moveTo(drawQueue[i][0] - 1, drawQueue[i][1]);

            socket.send(
                "p_" +
                drawQueue[i][0]
                + "_" +
                drawQueue[i][1]
                + "_" +
                getColor()
                + "_" +
                getSize()
            );
        }

        ctx.lineTo(drawQueue[i][0], drawQueue[i][1]);
        ctx.closePath();
        ctx.stroke();

    }
}

$canvas.addEventListener("mousedown", function(event) {

    if (event.buttons == 2) {
        event.preventDefault();
        return;
    }

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

            var paintRegex = /p_\d+_\d+_\#[0-9a-fA-F]+_\d+/;
            var lineRegex = /l_\d+_\d+_\d+_\d+_\#[0-9a-fA-F]+_\d+/;
            var usersRegex = /u_\d+/;

            if (paintRegex.test(cmd)) {
                var data = cmd.split("_");
                if (data.length == 5) {
                    var x = parseInt(data[1]);
                    var y = parseInt(data[2]);
                    var c = String(data[3]);
                    var s = parseInt(data[4]);

                    ctx.strokeStyle = c;
                    ctx.lineJoin = "round";
                    ctx.lineWidth = s;

                    ctx.beginPath();
                    ctx.moveTo(x - 1, y);
                    ctx.lineTo(x, y);
                    ctx.closePath();
                    ctx.stroke();
                }
            }
            else if (lineRegex.test(cmd)) {
                var data = cmd.split("_")
                if (data.length == 7) {
                    var x1 = parseInt(data[1]);
                    var y1 = parseInt(data[2]);
                    var x2 = parseInt(data[3]);
                    var y2 = parseInt(data[4]);
                    var c = String(data[5]);
                    var s = parseInt(data[5]);

                    ctx.strokeStyle = c;
                    ctx.lineJoin = "round";
                    ctx.lineWidth = s;

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
            else if (usersRegex.test(cmd)) {
                var data = cmd.split("_");
                if (data.length == 2) {
                    var u = data[1];
                    $usersCount.innerHTML = "Active users: " + u;
                }
            }
        }

        socket.onerror = function(error) {
            console.log("error:");
            console.log(error);

            alert("Error: can't connect to " + url);
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
    if (socket != null) {
        socket.close();
        socket = null;
    }

    drawQueue = [];
    lineQueue = [];
};
