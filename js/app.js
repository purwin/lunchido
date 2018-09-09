// Knockout.js file


var ViewModel = function() {

  var self = this;

  // Stored FourSquare API info
  this.fourSquareAPI = {
    url: "https://api.foursquare.com/v2/venues/",
    client_id: "RGJIQWJAUURIHR1SSJUTQFKQYXL3RFO34MFEWPBBAFUALZ2B",
    client_secret: "2CA2UTR0RRAGVLIDRSUL20XK4YHY554Z0UKYYZCQ0IVLJKCA"
  }

  // Lunch starting point observable
  this.startingPoint = ko.observable(false);

  // General exclusion parameters
  this.excludeParams = ko.observable({
    count: 5,
    distance: "",
    types: [],
    price: 3
  })

  // Array of potential lunch options pulled from the FourSquare API
  this.lunchSearch = ko.observableArray([]);

// Lunch options observable array (max = this.excludeParams().count)
  this.lunchList = ko.observableArray([]);

  // Manual search input
  this.manualSearch = ko.observable();

  // Selected lunch spot
  this.currentSpot = ko.observable();


  // Function to use geolocation for Google Maps starting point
  this.geoLocater = function() {
    // Get lat, lng, and address from Google Maps geolocate function
    var x = geolocateMe(function(data) {
      // Set starting point details to returned object
      self.startingPoint(data);
    });
  };

  // Function to manually search for Google Maps starting point
  this.manualLocater = function() {
    // Get lat, lng, and address from Google Maps manual locate function
    var x = manualLocateMe(this.manualSearch(), function(data) {
      // Set starting point details to returned object
      self.startingPoint(data);
    });
  };

  // Function to highlight selected lunch option in list, show location on the map
  this.selectSpot = function(selected) {
    // set current lunch item to clicked item
    self.currentSpot(selected);
    // Run map function to show relevant marker and info window
    selectLunch(selected);
  };

  // Function to pull lunch options from FourSquare API
  this.getLunchData = function() {
    // JSON request to get a list of lunch options
    console.log("Searching " + self.startingPoint().lat + ", " + self.startingPoint().lng);
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
      // Add found item objects to self.lunchSearch array
      data.response.groups[0].items.forEach(function(item) {
        self.lunchSearch.push({
          type: item.venue.categories[0].shortName,
          venueID: item.venue.id,
          location: {
            lat: item.venue.location.lat,
            lng: item.venue.location.lng,
          },
          name: item.venue.name,
          address: item.venue.location.address
          });
      });
      // Run function to add lunch option to list
      self.getLunch();
    })
    .fail(function(jqxhr, textStatus, error) {
      var err = textStatus + ", " + error;
      console.log( "Request Failed: " + err );
    });
  };

  // Function to scrape a lunch option, add it to observableArray
  this.getLunch = function() {
    // Notify user if there are no nearby places left
    if (self.lunchSearch().length == 0) {
    window.alert("Your area is all out of options! Choose from the options presented.");
    }
    // Run function if user has places to choose from and < max option #
    else if (self.lunchSearch().length > 0 && self.lunchList().length < self.excludeParams().count) {
      // Pop random item from data list
      // var lunchItem = self.lunchSearch.splice(Math.floor(Math.random() * self.lunchSearch().length), 1)[0];
      self.checkPrice();

    // Notify user if they maxed-out their options
    }
    else {
      window.alert("No more options for you!");
    }

  };

  // Recursion function to call FourSquare API and check item's price against set max price
  this.checkPrice = function() {
    // get random place and pop from data list
    var lunchItem = self.lunchSearch.splice(Math.floor(Math.random() * self.lunchSearch().length), 1)[0];
    // get JSON of price from FourSquare API
    $.getJSON(self.fourSquareAPI.url + lunchItem.venueID, {
      // Query FourSquare API to get venue info (price)
      client_id: self.fourSquareAPI.client_id,
      client_secret: self.fourSquareAPI.client_secret,
      v: '20180827',
      format: "json"
    })
    .done(function(data) {
      // if price <= max price:
      if (data.response.venue.price.tier <= self.excludeParams().price) {
        lunchItem.price = data.response.venue.price.tier;
        console.log("checkPrice: " + lunchItem.name + " price " + lunchItem.price + " <= " + self.excludeParams().price);
        getDistance(self.startingPoint(), lunchItem, function(data) {
          console.log("getDistance: " + data);
          lunchItem.distance = data;
          // searchWithinTime(self.startingPoint(), lunchItem);
          self.pushOption(lunchItem);
        });
      }
      // ...otherwise call function again
      else {
        console.log("checkPrice: " + lunchItem.name + " price fails. Recursion time.");
        self.checkPrice();
      }
    })
    .fail(function(jqxhr, textStatus, error) {
      var err = textStatus + ", " + error;
      console.log( "Request Failed: " + err );
    });
  };

  // Function to display $ icon in place of numbered price item
  this.priceIcon = function(selected) {
    var x = "";
    for (i = 0; i < parseInt(selected.price); i++) {
      x += "$";
    }
    return x;
  };

  // Function to add item to lunchList
  this.pushOption = function(lunchItem) {
    // Add ID to new lunch item
    lunchItem.id = self.lunchList().length + 1;
    // Add lunch spot to option list
    self.lunchList.push(lunchItem);
    // Run create map marker function
    addLunch(lunchItem);
    // Run select lunch spot function
    self.selectSpot(lunchItem);
  };

  // Funtion to filter out lunch spot types
  this.filterParams = function() {
    self.lunchSearch.remove(function(value) {
      return self.excludeParams().types.indexOf(value.type) >= 0;
    })
  };

  this.updatePrice = function(selected) {
    // Set temporary var equal to passed argument price
    var priceCheck = parseInt(selected.price);
    // If max price is already lower than selected place's price, alert user
    if (priceCheck > self.excludeParams().price) {
      window.alert("The current max price is lower than this place! We'll search for another cheap place for you.");
    }
    // Otherwise update max price and filter data list
    else {
      // if selected place's price is lower than the current max price, update max price
      if(self.excludeParams().price <= 1 || priceCheck <= 1) {
        self.excludeParams().price = 1;
        window.alert("That's as low as we can go! We'll search for another cheap place for you.");
      }
      else {
        self.excludeParams().price = (priceCheck > 1) ? priceCheck - 1 : 1;
        // Update data list to filter new exclusion
        console.log("New max price: " + self.excludeParams().price);
      }
    }
    // Run function to find a new lunch option
    self.getLunch();
  }

  this.updateType = function(selected) {
    // if selected place's food type is not yet on the exlusions list, add it
    if (!self.excludeParams().types.includes(selected.type)) {
      self.excludeParams().types.push(selected.type);
      console.log("Updated food types to exclude: " + self.excludeParams().types);
      // Update data list to filter new exclusion
      self.filterParams();
    } else {
      window.alert("We got you covered! Already excluding " + selected.type + " options.");
      // self.getLunch();
    }
    // run getLunch function to get a new option with updated parameters
    self.getLunch();
  };

  // Function run when winning lunchItem is chosen
  this.pickSpot = function(selected) {
    console.log("Place Chosen: " + selected.name);
  };

}

ko.applyBindings(new ViewModel())