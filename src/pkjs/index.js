// On the phone, begin listening for a message from the smartwatch
Pebble.on('message', function(event) {
  // Get the message that was passed
  console.log(JSON.stringify(event.data));
  var message = event.data;
  if (message.getNearby) {
    initiateUpdateNearby();
  }
});

var locationOptions = {
  'timeout': 15000,
  'maximumAge': 60000
};

function locationError(err) {
  console.warn('location error (' + err.code + '): ' + err.message);
}
function locationSuccess(pos) {
  var coordinates = pos.coords;
  fetchNearbyUnillustrated(coordinates.latitude, coordinates.longitude);
}

function initiateUpdateNearby() {
  window.navigator.geolocation.getCurrentPosition(locationSuccess, locationError, locationOptions);
}

// http://tools.wmflabs.org/articles-by-lat-lon-without-images/index.php?wiki=sv&lat=59.06708056&lon=16.36239722&radius=10000
function fetchNearbyUnillustrated(latitude, longitude) {
  var radius = 10000;
  var url = 'http://tools.wmflabs.org/articles-by-lat-lon-without-images/index.php' +
            '?wiki=en' +
            '&lat=' + latitude +
            '&lon=' + longitude +
            '&radius=' + radius +
            '&reencode=true';
  console.log(url);
  var req = new XMLHttpRequest();
  req.open('GET', url, false);
  req.onload = function () {
    if (req.readyState === 4) {
      if (req.status === 200) {
        console.log(req.responseText);
        var response = JSON.parse(req.responseText);
        console.log(response.response);
        sendNearestToPebble(response[0]);
      } else {
        console.log('Error');
      }
    }
  };
  req.send(null);
}

function sendNearestToPebble(article) {
  Pebble.postMessage({
    article: article.title
  });
}