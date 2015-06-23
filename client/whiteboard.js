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
    $canvas.clearRect(0, 0, $canvas.width, $canvas.height);
    $canvas.fillStyle = "#ffffff";
    $canvas.fillRect(0, 0, $canvas.width, $canvas.height);
};

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
            console.log(msg);
            
            var cmd = msg.data;
            
            var paintRegex = /p_(\d+)_(\d+)_(\d+)/;
            var lineRegex = /l_(\d+)_(\d+)_(\d+)_(\d+)_(\d+)/;
            
            if (paintRegex.test(cmd)) {
                
            }
            else if (lineRegex.test(cmd)) {
                
            }
            else if (cmd == "c") {
                
            }
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
var reset = function() {
    clearCanvas();
    showInterface(false);
    socket = null;
};
