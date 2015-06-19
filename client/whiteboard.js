var CW = 1280;
var CH = 720;

var $canvas = document.getElementById("canvas");
var ctx = $canvas.getContext('2d');

$canvas.width = CW;
$canvas.height = CW;

ctx.fillStyle = '#000';
ctx.clearRect(0, 0, $canvas.width, $canvas.height);
ctx.fillRect(10, 10, 40, 40);
