 // file: /src/pkjs/index.js
/* globals Pebble, XMLHttpRequest, window, localStorage */

// Listen for when the watchface is opened
Pebble.addEventListener('ready', function(event) {
  initiateUpdateNearby();
});

// On the phone, begin listening for a message from the smartwatch
Pebble.addEventListener('appmessage', function(event) {
  // Get the message that was passed
  console.log(JSON.stringify(event.data));
  var message = event.data;
  if (message.getNearby) {
    initiateUpdateNearby();
  }
});

// Send an article for the Pebble to display
function sendArticleToPebble(article) {
  var distanceString = article.distanceAway.toFixed(1) + ' km ' + article.compassDirection
  Pebble.sendAppMessage({
    ARTICLE: article.title,
    DISTANCE: distanceString
  },
  function(e) {
    console.log('Article info sent to Pebble successfully!');
  },
  function(e) {
    console.log('Error sending article info to Pebble!');
  });
}


// Get location via standard geolocation API, and initiate
// search for Wikipedia articles upon success.
var myCoordinates;
var locationOptions = {
  'timeout': 15000,
  'maximumAge': 60000
};
function locationError(err) {
  console.warn('location error (' + err.code + '): ' + err.message);
}
function locationSuccess(pos) {
  myCoordinates = pos.coords;
  fetchNearbyUnillustrated(myCoordinates.latitude, myCoordinates.longitude);
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
        processNearbyArticles(response);
        // notifyIfNew(response[0]);
      } else {
        console.log('Error');
      }
    }
  };
  req.send(null);
}

// Calculate the distanceAway for each nearby article and find the nearest.
// Results from the wmflabs tool are not ordered by proximity.
var nearestArticle;
var allNearbyArticles;
function processNearbyArticles(articles) {
  articles = articles.map( function(article) {
    var articleCoordinates = {
      latitude: article.lat,
      longitude: article.lon
    };
    article.distanceAway = haversine(myCoordinates, articleCoordinates, { unit: 'km' });
    return article;
  });

  nearestArticle = articles[0];
  allNearbyArticles = articles;

  articles.forEach( function(article) {
    if (article.distanceAway <= nearestArticle.distanceAway) {
      nearestArticle = article;
      console.log(nearestArticle.title);
      console.log(nearestArticle.distanceAway);
    }
  });
  nearestArticle.compassDirection = compassDirection(myCoordinates, nearestArticle);
  console.log(nearestArticle.title);
  updateNearest(nearestArticle);
}

// Add the article to local storage, if it's not there yet.
// Send the article to Pebble, along with its isNew status.
// Create a notification if it's new.
function updateNearest(article) {
  var title = article.title;
  var storedItem = localStorage.getItem(title);
  console.log(storedItem);
  if (!storedItem) {
    sendArticleToPebble(article, true);
    localStorage.setItem(title, 'true');
    Pebble.showSimpleNotificationOnPebble(title, 'NEW!'); // Does not work yet on Rocky.js
  } else {
    console.log('already done!');
    sendArticleToPebble(article, false);
  }
}

// haversine formula for calculating distance between coordinates
// adapted from https://github.com/njj/haversine/blob/master/haversine.js
function toRadians(degrees) {
  return (degrees * Math.PI / 180);
}

function toDegrees(radians) {
  return radians * (180 / Math.PI);
}

function haversine(start, end, options) {
  options = options || {};

  var radii = {
    km:    6371,
    mile:  3960,
    meter: 6371000
  };

  var R = options.unit in radii ? radii[options.unit] : radii.km;

  var dLat = toRadians(end.latitude - start.latitude);
  var dLon = toRadians(end.longitude - start.longitude);
  var lat1 = toRadians(start.latitude);
  var lat2 = toRadians(end.latitude);

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  if (options.threshold) {
    return options.threshold > (R * c);
  }

  return R * c;
}

// Determine what direction an article is in from the current location
// based on 16-wind compass.
function compassDirection(currentLocation, article) {
  var startLat = toRadians(currentLocation.latitude);
  var startLong = toRadians(currentLocation.longitude);
  var endLat = toRadians(article.lat);
  var endLong = toRadians(article.lon);

  var dLong = endLong - startLong;

  var dPhi = Math.log(Math.tan(endLat/2.0+Math.PI/4.0)/Math.tan(startLat/2.0+Math.PI/4.0));
  if (Math.abs(dLong) > Math.PI){
    if (dLong > 0.0)
       dLong = -(2.0 * Math.PI - dLong);
    else
       dLong = (2.0 * Math.PI + dLong);
  }
  var degrees = (toDegrees(Math.atan2(dLong, dPhi)) + 360.0) % 360.0;
  switch (true) {
    case degrees <= 11.25:
      return 'N';
    case degrees <= 33.75:
      return 'NNE';
    case degrees <= 56.25:
      return 'NE';
    case degrees <= 78.75:
      return 'ENE';
    case degrees <= 101.25:
      return 'E';
    case degrees <= 123.75:
      return 'ESE';
    case degrees <= 146.25:
      return 'SE';
    case degrees <= 168.75:
      return 'SSE';
    case degrees <= 191.25:
      return 'S';
    case degrees <= 213.75:
      return 'SSW';
    case degrees <= 236.25:
      return 'SW';
    case degrees <= 258.75:
      return 'WSW';
    case degrees <= 281.25:
      return 'W';
    case degrees <= 303.75:
      return 'WNW';
    case degrees <= 326.25:
      return 'NW';
    case degrees <= 348.75:
      return 'NNW';
    case degrees <= 360:
      return 'N';
  }
}