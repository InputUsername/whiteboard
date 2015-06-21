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
}

showInterface(false);

// Connection stuff
var makeUrl = function(host, port) {
    return "ws://" + host + ":" + port + "/whiteboard";
}

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

/*
var painting = false;
var drawQueue = [];
var dragQueue = [];

var line = function(x1, y1, x2, y2, func) {
    var deltaX = Math.abs(x2 - x1);
    var deltaY = Math.abs(y2 - y1);

    if (deltaX == 0) {
        var startY = Math.min(y1, y2);
        var endY = Math.max(y1, y2);

        for (var y = startY; y <= endY; y++) {
            func(x1, y);
        }
    }

    var slope = Math.round(deltaY / deltaX);
    var startX = Math.min(x1, x2);
    var endX = Math.max(x1, x2);

    for (var x = startX; x <= endX; x++) {
        var y = Math.min(y1, y2) + (slope * x);

        func(x, y);
    }
}

var redraw = function(clear) {
    if (clear) {
        ctx.strokeStyle = "#ffffff";
    }
    else {
        ctx.strokeStyle = "#000000";
    }

    ctx.lineJoin = "round";
    ctx.lineWidth = 5;

    var length = Math.min(drawQueue.length, dragQueue.length);

    for (var i = 0; i < length; i++) {
        if (dragQueue[i] && i) {
            line(drawQueue[i - 1][0], drawQueue[i - 1][1],
                drawQueue[i][0], drawQueue[i][1],
                function(x, y) {
                    ctx.moveTo(drawQueue[i][0] - 1, drawQueue[i][1]);
                    ctx.lineTo(drawQueue[i][0], drawQueue[i][1]);
                    ctx.closePath();
                    ctx.stroke();

                    socket.send("p_" + x + "_" + y);
                });
        }
        else {
            ctx.moveTo(drawQueue[i][0] - 1, drawQueue[i][1]);
            ctx.lineTo(drawQueue[i][0], drawQueue[i][1]);
            ctx.closePath();
            ctx.stroke();

            socket.send("p_" + drawQueue[i][0] + "_" + drawQueue[i][1]);
        }
    }

    drawQueue = [];
    dragQueue = [];
}

$canvas.addEventListener("mousedown", function(event) {
    if (socket == null) {
        return;
    }

    var mouseX = event.pageX - this.offsetLeft;
    var mouseY = event.pageY - this.offsetTop;
    drawQueue.push( [mouseX, mouseY] );
    dragQueue.push(false);

    redraw(false);

    painting = true;
}, false);

$canvas.addEventListener("mousemove", function(event) {
    if (socket == null) {
        return;
    }

    if (painting) {
        var mouseX = event.pageX - this.offsetLeft;
        var mouseY = event.pageY - this.offsetTop;
        drawQueue.push( [mouseX, mouseY] );
        dragQueue.push(true);

        redraw(false);
    }
}, false);

$canvas.addEventListener("mouseup", function(event) {
    if (socket == null) {
        return;
    }

    painting = false;
}, false);

*/

// Connection stuff
$connect.addEventListener("click", function() {

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
            console.log("got message:");
            //console.log(msg);
        }

        socket.onerror = function(error) {
            console.log("error:");
            console.log(error);
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

}, false);

// General stuff
var clearCanvas = function() {
    $canvas.clearRect(0, 0, $canvas.width, $canvas.height);
    $canvas.fillStyle = "#ffffff";
    $canvas.fillRect(0, 0, $canvas.width, $canvas.height);
}

/*

var begin = function() {
    console.log("")
}

var reset = function() {
    console.log("reset");
    socket.close();
    socket = null;
    showInterface(false);
}

*/
