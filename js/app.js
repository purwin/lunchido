// Knockout.js file

// model:
//   startingPoint
//   lunchOptions
//   savedPlaces
//   searchParams
// initialLunch = [
// {
//   name: "Place 1",
//   location: {
//     lat: 40.7579854,
//     lng: -73.8829541
//   }
// ];

var ViewModel = function() {

  var self = this;

  // Lunch starting point observable
  this.startingPoint = ko.observable({
    address: "Jackson Heights, Queens, NY, USA",
    lat: 40.7556818,
    lng: -73.8830701
  });

  // General exclusion parameters
  this.excludeParams = ko.observable({
    distance: "",
    types: [] 
  })

  // Array of potential lunch options pulled from the FourSquare API
  this.lunchSearch = ko.observableArray([]);

// Lunch options observable array (max 5)
  this.lunchList = ko.observableArray([]);

  // Manual search input
  this.manualSearch = ko.observable();

  // Selected lunch spot
  this.currentSpot = ko.observable();

  // Function to use geolocation for Google Maps starting point
  this.geoLocater = function() {
    var x = geolocateMe();
    console.log(x);
    self.startingPoint(x);
  }

  // Function to manually search for Google Maps starting point
  this.manualLocater = function() {
    console.log(this.manualSearch());
    var x = manualLocateMe(this.manualSearch());
    console.log(x);
    this.startingPoint(x);
  }

  // Function to add new lunch option
  this.addOption = function(selected) {
    // console.log(selected);
    addLunch(selected);
  };

  // Function to highlight selected lunch option in list, show location on the map
  this.selectedSpot = function(selected) {
    // set current lunch item to clicked item
    self.currentSpot(selected.id);
    // Run map function to show relevant marker and info window
    selectLunch(selected);
  }

  // Function to pull lunch options from FourSquare API
  this.getLunchData = function() {
    var fourSquareAPI = "https://api.foursquare.com/v2/venues/explore";
    // JSON request
    console.log("Searching " + self.startingPoint().lat.toString() + ", " + self.startingPoint().lng.toString());
    $.getJSON( fourSquareAPI, {
      // Pull relevant data from the API
      client_id: "RGJIQWJAUURIHR1SSJUTQFKQYXL3RFO34MFEWPBBAFUALZ2B",
      client_secret: "2CA2UTR0RRAGVLIDRSUL20XK4YHY554Z0UKYYZCQ0IVLJKCA",
      ll: self.startingPoint().lat + "," + self.startingPoint().lng,
      v: '20180827',
      query: "lunch",
      limit: "50",
      openNow: "1",
      price: "1,2,3",
      format: "json"
    })
    .done(function(data) {
      data.response.groups[0].items.forEach(function(item) {
        // Add found items to self.lunchSearch list
        self.lunchSearch.push({
          type: item.venue.categories[0].shortName,
          venueID: item.venue.id,
          location: {
            lat: item.venue.location.lat,
            lng: item.venue.location.lng,
          },
          name: item.venue.name,
          shortAddress: item.venue.location.address
          });
      });
    })
    .fail(function(jqxhr, textStatus, error) {
      var err = textStatus + ", " + error;
      console.log( "Request Failed: " + err );
    });
  }

  // Function to get a lunch option, add it to observableArray
  this.getLunch = function() {
    if (self.lunchSearch().length > 0 && self.lunchList().length < 5) {
      // Get random lunch spot from search array, remove from array
      lunchItem = self.lunchSearch.splice(Math.floor(Math.random()*self.lunchSearch().length), 1);
      // Apply id to lunch item
      lunchItem[0].id = self.lunchList().length + 1;
      // Add lunch spot to option list
      self.lunchList.push(lunchItem[0]);
      // Run create map marker function
      addLunch(lunchItem[0]);
      // Run select lunch spot function
      this.selectedSpot(lunchItem[0]);
    } else {
      alert("No more options for you!");
    }
    // this.lunchList.push(self.lunchSearch[]);
    // if this.lunchList().length < 5...
    // while false:
    // get random item from getLunchData, pop item
    // Check item against excluded parameters
    // if so, return true
    // add item to this.lunchList
  }

}

ko.applyBindings(new ViewModel())