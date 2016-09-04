// file: /src/rocky/index.js
var rocky = require('rocky');

var article;

rocky.on('draw', function(event) {
  // Get the CanvasRenderingContext2D object
  var ctx = event.context;

  // Clear the screen
  ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);

  // Determine the width and height of the display
  var w = ctx.canvas.unobstructedWidth;
  var h = ctx.canvas.unobstructedHeight;

  // Current date/time
  var d = new Date();

  // Set the text color
  ctx.fillStyle = 'white';

  // Center align the text
  ctx.textAlign = 'center';

  // Display the time, in the middle of the screen
  ctx.fillText(d.toLocaleTimeString(), w / 2, h / 6, w);

  if (article) {
    ctx.fillText(article, w / 2, h / 2, w);
  }
});

rocky.on('minutechange', function(event) {
  // Request the screen to be redrawn on next pass
  rocky.requestDraw();
  rocky.postMessage({ getNearby: true });
  // Display a message in the system logs
  console.log("ohai");
});

rocky.on('message', function(event) {
  var message = event.data;
  if (message.article) {
    article = message.article;
  }
  rocky.requestDraw();
});

