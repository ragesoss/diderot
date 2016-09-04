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
  fetchNearby(coordinates.latitude, coordinates.longitude);
}

function initiateUpdateNearby() {
  window.navigator.geolocation.getCurrentPosition(locationSuccess, locationError, locationOptions);
}
function fetchNearby(latitude, longitude) {
  var radius = 10000;
  var articleLimit = 10;
  var url = 'https://en.wikipedia.org/w/api.php?action=query' +
            '&prop=coordinates|pageimages|pageterms' +
            '&generator=geosearch' +
            '&ggscoord=' + latitude + '|' + longitude +
            '&ggsradius=' + radius +
            '&ggslimit=' + articleLimit +
            'piprop=thumbnail' +
            'pilimit=' + articleLimit +
            'colimit=' + articleLimit +
            'wbptterms=description' +
            '&format=json';
  console.log(url);
  var req = new XMLHttpRequest();
  req.open('GET', url, false);
  req.onload = function () {
    if (req.readyState === 4) {
      if (req.status === 200) {
        console.log(req.responseText);
        var response = JSON.parse(req.responseText);
        console.log(response.query.pages);
        var nearest = nearestUnillustrated(response.query.pages);
        sendNearestToPebble(nearest);
      } else {
        console.log('Error');
      }
    }
  };
  req.send(null);
}

function nearestUnillustrated(pages) {
  for (var page in pages) {
    if (pages.hasOwnProperty(page)) {
      var index = pages[page].index;
      console.log(index);
      if (pages[page].thumbnail) {
        continue;
      } else {
        var nearest = {
          title: pages[page].title,
          description: pages[page].terms.description
        };
        console.log(pages[page].title);
        return nearest;
      }
    }
  }
}

function sendNearestToPebble(article) {
  Pebble.postMessage({
    article: article.title
  });
}