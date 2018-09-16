
var map, infoWindow, bounds;

var directionsDisplay = null;

var markers = [];

window.initMap = initMap;

// Create map
export function initMap() {
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
    streetViewControl: true
  });
  bounds = new google.maps.LatLngBounds();

  // Define InfoWindow
  infoWindow = new google.maps.InfoWindow;
}

// Set map based on text input, return lat, lng, and formatted_address as a callback
export function manualLocateMe(address, callback) {
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
export function geolocateMe(callback) {
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

export function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        "Error: The Geolocation service failed." :
                        "Error: Your browser doesn’t support geolocation.");
  infoWindow.open(map);
}

// Get formatted_address for geolocation
export function geocodeLatLng(pos, geocoder, callback) {
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
export function createMarker(position, title) {
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
export function makeMarkerIcon(markerColor) {
  var markerImage = new google.maps.MarkerImage(
    'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
    '|40|_|%E2%80%A2',
    new google.maps.Size(21, 34),
    new google.maps.Point(0, 0),
    new google.maps.Point(10, 34),
    new google.maps.Size(21,34)
  );
  return markerImage;
}

// Adapted from Udacity https://github.com/udacity/ud864
// This function will loop through the listings and hide them all.
export function hideListings() {
  markers.forEach(function(item) {
    item.setMap(null);
  })
}

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
export function populateInfoWindow(marker, infowindow) {
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
export function addLunch(location) {
  console.log("addLunch: " + JSON.stringify(location));
  var newMarker = createMarker(location.location, location.name);
  map.fitBounds(bounds, 25);
}

export function selectLunch(location) {
  populateInfoWindow(markers[location.id], infoWindow);
  // markers[location.id-1].setIcon(highlightedIcon);
}

// Adapted from Udacity https://github.com/udacity/ud864
// This function allows calculates the distance between the starting point and a lunch option
export function getDistance(origin, destination, callback) {
  // Initialize the distance matrix service.
  var distanceMatrixService = new google.maps.DistanceMatrixService;
  var address = origin.address;
  // Check to make sure the place entered isn't blank.
  if (address == "") {
    window.alert("You must enter an address.");
  } else {
    var mode = "WALKING";
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
        // Return distance in callback
        callback(distance);
      }
    });
  }
}

// Adapted from Udacity https://github.com/udacity/ud864
// This function displays directions between the starting point and the chosen
// lunch spot
export function getDirections(origin, destination, mode, callback) {
  var directionsService = new google.maps.DirectionsService;
  directionsService.route({
    origin: origin.address,
    destination: destination.location,
    travelMode: google.maps.TravelMode[mode]
  }, function(response, status) {
    if (status === google.maps.DirectionsStatus.OK) {
      // Declare return var
      var travel = {
        // Get travel time in minutes
        time: response.routes[0].legs[0].duration.text,
        directions: []
      };
      // Get travel direction steps
      response.routes[0].legs[0].steps.forEach(function(item) {
        travel.directions.push(item.instructions);
      })
      // Return direction steps and travel time
      callback(travel);
      // Remove current markers
      hideListings();
      // Display map directions
      if (directionsDisplay) {
        directionsDisplay.setMap(null);
      }
      directionsDisplay = new google.maps.DirectionsRenderer({
        map: map,
        directions: response,
        draggable: true,
        polylineOptions: {
          strokeColor: '#f78fb3'
        }
      });
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });
}
