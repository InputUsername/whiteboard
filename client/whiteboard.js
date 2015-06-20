// Canvas stuff
var $canvas = document.getElementById("canvas");

if (!$canvas.getContext || !window.WebSocket) {
  var body = document.getElementsByTagName("body");
  body[0].innerHTML = "<p>Oops! Your browser doesn't support canvas or WebSockets!</p>";
}

var ctx = $canvas.getContext('2d');

var CW = 1280;
var CH = 720;

$canvas.width = CW;
$canvas.height = CW;

ctx.clearRect(0, 0, $canvas.width, $canvas.height);

// Connection stuff
var $connection = document.getElementById("connection");
var $host = document.getElementById("host");
var $port = document.getElementById("port");
var $connect = document.getElementById("connect");

var socket = null;

var setupSocket = function(url) {
  socket = new WebSocket(url, "whiteboard");
  
  socket.onopen = function() {
    ctx.clearRect(0, 0, $canvas.width, $canvas.height);
    
    $connection.style.display = "none";
    
    //debug
    alert("sending 'ping!'");
    socket.send("ping!");
  }
  
  socket.onmessage = function(data) {
    alert("Got data: " + data);
  }
  
  socket.onclose = function() {
    ctx.clearRect(0, 0, $canvas.width, $canvas.height);
  }
}

$connect.addEventListener("click", function() {
  var host = $host.value;
  var port = $port.value;
  
  if (host != "" && port != "") {
    setupSocket(host + ":" + port);
  }
}, false);
