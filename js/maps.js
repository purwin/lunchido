// get start point

// get first rando open place

// determine if it's within 15 mins

// get:
// name,
// location,
// food type,
// price,
// reviews,
// photos,
// distance in time

// add it to list

// if perfect:
// give directions

// if not:
//   update search params
//   run search function




// search params (updated throughout):
// maxPrice (3 at first)
// excludeType (empty at first)
// maxDistance (15min at first)

var map, infoWindow, bounds;

var markers = [];

// Create map
function initMap() {
  var styles = [
    {
      "featureType": "poi",
      "elementType": "labels.text",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "poi.business",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "labels.icon",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "transit",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    }
  ];

  // Define map
  map = new google.maps.Map(document.getElementById("map"), {
    center: {lat: 39.952583, lng: -75.165222},
    zoom: 15,
    fullscreenControl: false,
    mapTypeControl: false,
    styles: styles,
    zoomControl: true,
    zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_CENTER
    },
    streetViewControl: true,
    streetViewControlOptions: {
        position: google.maps.ControlPosition.RIGHT_CENTER
    }
  });
  bounds = new google.maps.LatLngBounds();

  // Define InfoWindow
  infoWindow = new google.maps.InfoWindow;
}

// Set map based on text input, return lat, lng, and formatted_address as a callback
function manualLocateMe(address, callback) {
  // Initialize the geocoder.
  var geocoder = new google.maps.Geocoder();
  // Make sure the address isn't blank.
  if (address == '') {
    window.alert("You gotta enter an address or location!");
  } else {
    // Geocode the address/area entered to get the center. Then, center the map
    // on it and zoom in
    geocoder.geocode(
      { address: address,
      }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          map.setCenter(results[0].geometry.location);
          map.setZoom(15);
          // Store lat/lng coordinates
          var coords = {
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng()
          }
          // Store address name
          coords.address = results[0].formatted_address;

          // Return coordinates
          callback(coords);

          // Create a marker
          var startMarker = createMarker(results[0].geometry.location, "Lunch start");
        } else {
          window.alert("Couldn’t find that location. Try being more specific.");
        }
      });
  }
}

// Function: Set map based on geolocation
function geolocateMe(callback) {
  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      var startMarker = createMarker(pos, "Lunch start");

      map.setCenter(pos);
      // bounds.extend(pos);

      // Call geocodeLatLng function to get formatted address
      var geocoder = new google.maps.Geocoder();
      var x = geocodeLatLng(pos, geocoder, function(data) {

        // Get formatted address
        pos.address = data;

        // Return coordinates and formatted address with callback
        callback(pos);
      });

    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        "Error: The Geolocation service failed." :
                        "Error: Your browser doesn’t support geolocation.");
  infoWindow.open(map);
}

// Get formatted_address for geolocation
function geocodeLatLng(pos, geocoder, callback) {
  geocoder.geocode(
    { 'location': pos,
    }, function(results, status) {
    if (status === 'OK') {
        callback(results[0].formatted_address);
    } else {
      window.alert('Geocoder failed due to: ' + status);
    }
  });
}


// Function: Create a marker, add click events, re-fit the map based on the added markers, and add marker to the map
function createMarker(position, title) {
  // Style the markers a bit. This will be our listing marker icon.
  var defaultIcon = makeMarkerIcon('f3a683');

  // Create a "highlighted location" marker color for when the user
  // mouses over the marker.
  var highlightedIcon = makeMarkerIcon('f19066');

  // Create new marker
  var marker = new google.maps.Marker({
    position: position,
    map: map,
    title: title,
    icon: defaultIcon,
    // label: item[id],
    animation: google.maps.Animation.DROP,
  });

  markers.push(marker);
  // Add click event to display marker info window
  marker.addListener('click', function() {
    populateInfoWindow(this, infoWindow);
  });
  // Two event listeners - one for mouseover, one for mouseout,
  // to change the colors back and forth.
  marker.addListener('mouseover', function() {
    this.setIcon(highlightedIcon);
  });
  marker.addListener('mouseout', function() {
    this.setIcon(defaultIcon);
  });

  bounds.extend(marker.position);
  return marker;
}

// This function takes in a COLOR, and then creates a new marker
// icon of that color. The icon will be 21 px wide by 34 high, have an origin
// of 0, 0 and be anchored at 10, 34).
function makeMarkerIcon(markerColor) {
  var markerImage = new google.maps.MarkerImage(
    'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
    '|40|_|%E2%80%A2',
    new google.maps.Size(21, 34),
    new google.maps.Point(0, 0),
    new google.maps.Point(10, 34),
    new google.maps.Size(21,34));
  return markerImage;
}

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker != marker) {
    infowindow.marker = marker;
    infowindow.setContent('<div>' + marker.title + '</div>');
    infowindow.open(map, marker);
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick',function(){
      infowindow.setMarker = null;
    });
  }
}

// This function creates and adds a lunch spot marker to the map
function addLunch(location) {
  console.log("addLunch: " + JSON.stringify(location));
  var newMarker = createMarker(location.location, location.name);
  map.fitBounds(bounds);
  // ViewModel.lunchList.push(location);
  // console.log(initialLunch);
}

function selectLunch(location) {
  populateInfoWindow(markers[location.id], infoWindow);
  // markers[location.id-1].setIcon(highlightedIcon);
}

// Adapted from Udacity https://github.com/udacity/ud864
// This function allows the user to input a desired travel time, in
// minutes, and a travel mode, and a location - and only show the listings
// that are within that travel time (via that travel mode) of the location
function getDistance(origin, destination, callback) {
  // Initialize the distance matrix service.
  var distanceMatrixService = new google.maps.DistanceMatrixService;
  var address = origin.address;
  // Check to make sure the place entered isn't blank.
  if (address == "") {
    window.alert("You must enter an address.");
  } else {
    // Use the distance matrix service to calculate the duration of the
    // routes between all our markers, and the destination address entered
    // by the user. Then put all the origins into an origin matrix.
    var mode = "WALKING";
    // Now that both the origins and destination are defined, get all the
    // info for the distances between them.
    distanceMatrixService.getDistanceMatrix({
      origins: [address],
      destinations: [destination.address],
      travelMode: google.maps.TravelMode[mode],
      unitSystem: google.maps.UnitSystem.IMPERIAL,
    }, function(response, status) {
      if (status !== google.maps.DistanceMatrixStatus.OK) {
        window.alert("Error: " + status);
      } else {
        // Get distance from origin to lunch spot in meters
        var distance = response["rows"][0]["elements"][0]["distance"].value;
        console.log("distance response: " + distance);
        // Return distance in callback
        callback(distance);
      }
    });
  }
}
