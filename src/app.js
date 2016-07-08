/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');
var Vector2 = require('vector2');

var main = new UI.Card({
  title: 'Pebble.js',
  icon: 'images/menu_icon.png',
  subtitle: 'Hello World!',
  body: 'Press any button.',
  subtitleColor: 'indigo', // Named colors
  bodyColor: '#9a0036' // Hex colors
});

main.show();

main.on('click', 'up', function(e) {
  var menu = new UI.Menu({
    sections: [{
      items: [{
        title: 'Pebble.js',
        icon: 'images/menu_icon.png',
        subtitle: 'Can do Menus'
      }, {
        title: 'Second Item',
        subtitle: 'Subtitle Text'
      }, {
        title: 'Third Item',
      }, {
        title: 'Fourth Item',
      }]
    }]
  });
  menu.on('select', function(e) {
    console.log('Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);
    console.log('The item is titled "' + e.item.title + '"');
  });
  menu.show();
});

main.on('click', 'select', function(e) {
  var wind = new UI.Window({
    backgroundColor: 'black'
  });
  var radial = new UI.Radial({
    size: new Vector2(140, 140),
    angle: 0,
    angle2: 300,
    radius: 20,
    backgroundColor: 'cyan',
    borderColor: 'celeste',
    borderWidth: 1,
  });
  var textfield = new UI.Text({
    size: new Vector2(140, 60),
    font: 'gothic-24-bold',
    text: 'Dynamic\nWindow',
    textAlign: 'center'
  });
  var windSize = wind.size();
  // Center the radial in the window
  var radialPos = radial.position()
      .addSelf(windSize)
      .subSelf(radial.size())
      .multiplyScalar(0.5);
  radial.position(radialPos);
  // Center the textfield in the window
  var textfieldPos = textfield.position()
      .addSelf(windSize)
      .subSelf(textfield.size())
      .multiplyScalar(0.5);
  textfield.position(textfieldPos);
  wind.add(radial);
  wind.add(textfield);
  wind.show();
});

main.on('click', 'down', function(e) {
  initiateShowNearby();
});

function renderArticleCard(page) {
  var card = new UI.Card();
  card.title(page.title);
  card.body(page.description);
  card.show();
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
        renderArticleCard(nearest);
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

var locationOptions = {
  'timeout': 15000,
  'maximumAge': 60000
};

function initiateShowNearby() {
  window.navigator.geolocation.getCurrentPosition(locationSuccess, locationError, locationOptions);
}

function locationSuccess(pos) {
  var coordinates = pos.coords;
  fetchNearby(coordinates.latitude, coordinates.longitude);
}

function locationError(err) {
  console.warn('location error (' + err.code + '): ' + err.message);
}
