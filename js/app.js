// Knockout.js file


var ViewModel = function() {

  // Stored FourSquare API info
  this.fourSquareAPI = {
    url: "https://api.foursquare.com/v2/venues/",
    client_id: "RGJIQWJAUURIHR1SSJUTQFKQYXL3RFO34MFEWPBBAFUALZ2B",
    client_secret: "2CA2UTR0RRAGVLIDRSUL20XK4YHY554Z0UKYYZCQ0IVLJKCA"
  }

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
    types: [],
    price: 3
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
    console.log("GEOLOCATE RETURN: " + x);
    self.startingPoint(x);
  }

  // Function to manually search for Google Maps starting point
  this.manualLocater = function() {
    console.log(this.manualSearch());
    var x = manualLocateMe(this.manualSearch());
    console.log("MANUAL RETURN: " + x);
    this.startingPoint(x);
  }

  // Function to add new lunch option
  this.addOption = function(selected) {
    // console.log(selected);
    addLunch(selected);
  };

  // Function to highlight selected lunch option in list, show location on the map
  this.selectSpot = function(selected) {
    // set current lunch item to clicked item
    self.currentSpot(selected);
    console.log("currentSpot: " + selected);
    console.log("currentSpot ID: " + self.currentSpot().id);
    console.log("currentSpot price: " + self.currentSpot().price);
    // Run map function to show relevant marker and info window
    selectLunch(selected);
  }

  // Function to pull lunch options from FourSquare API
  this.getLunchData = function() {
    // JSON request
    console.log("Searching " + self.startingPoint().lat.toString() + ", " + self.startingPoint().lng.toString());
    $.getJSON( self.fourSquareAPI.url + "explore", {
      // Pull relevant data from the API
      client_id: self.fourSquareAPI.client_id,
      client_secret: self.fourSquareAPI.client_secret,
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
          shortAddress: item.venue.location.address,
          price: null
          });
      });
      self.getLunch();
    })
    .fail(function(jqxhr, textStatus, error) {
      var err = textStatus + ", " + error;
      console.log( "Request Failed: " + err );
    });
  }

  // Function to scrape a lunch option, add it to observableArray
  this.getLunch = function() {
    if (self.lunchSearch().length > 0 && self.lunchList().length < 5) {
      // Get random lunch spot from search array, remove from array
      lunchItem = self.lunchSearch.splice(Math.floor(Math.random()*self.lunchSearch().length), 1);
      // Apply id to lunch item
      lunchItem[0].id = self.lunchList().length + 1;
      // Get price parameter from FourSquare API
      $.getJSON( self.fourSquareAPI.url + lunchItem[0].venueID, {
        // Query FourSquare API to get venue info (price)
        client_id: self.fourSquareAPI.client_id,
        client_secret: self.fourSquareAPI.client_secret,
        v: '20180827',
        format: "json"
      })
      .done(function(data) {
        try {
          // Pull price data from the API, add to object
          lunchItem[0].price = data.response.venue.price.tier;
        }
        catch(error) {
          console.log(error);
        }
      })
      .fail(function(jqxhr, textStatus, error) {
        var err = textStatus + ", " + error;
        console.log( "Request Failed: " + err );
      });
      // Add lunch spot to option list
      self.lunchList.push(lunchItem[0]);
      // Run create map marker function
      addLunch(lunchItem[0]);
      // Run select lunch spot function
      self.selectSpot(lunchItem[0]);
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

  this.updatePrice = function(selected) {
    if (self.excludeParams().price <= selected.price){

    }
    console.log("New price: " + self.excludeParams().price);
    // console.log(self.lunchList()[self.lunchList().length-1]);
  }

  this.updateType = function(selected) {
    if (!self.excludeParams().types.includes(selected.type)) {
      self.excludeParams().types.push(selected.type);
      console.log(self.excludeParams().types);
    }
  }

}

ko.applyBindings(new ViewModel())