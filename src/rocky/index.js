// file: /src/rocky/index.js
var rocky = require('rocky');

var article;
var isNew;
var displayTime;
var kilometersAway;

// Main update event. Redraw with the new time,
// Then request an update of the nearby article.
rocky.on('minutechange', function(event) {
  setTime();
  // Request the screen to be redrawn on next pass
  rocky.requestDraw();
  rocky.postMessage({ getNearby: true });
});

// Handle messages from pebblekit.js
// Redraw when a nearby article is received.
rocky.on('message', function(event) {
  var message = event.data;
  if (message.article) {
    article = message.article;
    isNew = message.isNew;
    kilometersAway = message.kilometersAway;

    rocky.requestDraw();
  }
});

rocky.on('draw', function(event) {
  // Get the CanvasRenderingContext2D object
  var ctx = event.context;

  // Clear the screen
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);

  // Determine the width and height of the display
  var w = ctx.canvas.unobstructedWidth;
  var h = ctx.canvas.unobstructedHeight;

  // Set the text color
  ctx.fillStyle = '#3333ff';
  // Center align the text
  ctx.textAlign = 'center';

  ctx.font = '30px bolder Bitham';  
  // Display the time, in the middle of the screen
  ctx.fillText(displayTime, w / 2, h / 6, w);

  ctx.fillStyle = 'black';
  ctx.font = '21px Roboto';
  var displayArticle = article + ' (' + kilometersAway + ' km)';

  if (isNew === true) {
    displayArticle += ' (NEW!)';
  }
  if (article) {
    ctx.fillText(displayArticle, w / 2, h / 2, w);
  }
});

// Get the current time and set the global displayTime string
// Format: 8:33 pm
function setTime() {
  var tickTime = new Date();
  var hours = tickTime.getHours();
  var ampm = 'am';
  if (hours > 12) {
    hours = hours - 12;
    ampm = 'pm';
  }
  var minutes = tickTime.getMinutes();
  if (minutes < 10) {
    minutes = '0' + minutes;
  }
  
  displayTime = hours + ':' + minutes + ' ' + ampm;
}
