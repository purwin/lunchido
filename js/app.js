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
    // Get lat, lng, and address from Google Maps geolocate function
    var x = geolocateMe(function(data) {
      // Set starting point details to returned object
      self.startingPoint(data);
    });
  }

  // Function to manually search for Google Maps starting point
  this.manualLocater = function() {
    // Get lat, lng, and address from Google Maps manual locate function
    var x = manualLocateMe(this.manualSearch(), function(data) {
      // Set starting point details to returned object
      self.startingPoint(data);
    });
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
    // Run map function to show relevant marker and info window
    selectLunch(selected);
  }

  // Function to pull lunch options from FourSquare API
  this.getLunchData = function() {
    // JSON request
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
          // price: null
          });
      });
      self.lunchSearch().forEach(function(item) {
        self.getPrice(item, function(price) {
          console.log("foreach price: " + item + " and " + price);
          item.price = price;
        })
      });
    })
    .done(function() {
      self.getLunch();
    })
    .fail(function(jqxhr, textStatus, error) {
      var err = textStatus + ", " + error;
      console.log( "Request Failed: " + err );
    });
  }

  this.filterParams = function() {
    var lunchItem = self.lunchSearch.splice(Math.floor(Math.random() * self.lunchSearch().length), 1)[0];

    if (self.excludeParams().types.indexOf(lunchItem.type) >= 0) {
      console.log("lunchItem's type is in exclusion array. Recursion!");
      self.filterParams()
    } else {
      console.log("lunchItem type is OK! Moving forward.");
      self.getPrice(lunchItem, function(price) {
        console.log("filterParam Price: " + price);
        lunchItem.price = price;
        if (parseInt(lunchItem.price) <= parseInt(self.excludeParams().price)) {
          console.log("Price is OK! Returning lunchItem");
          return lunchItem;
        } else {
          console.log("Price is too high. Recursion!");
          self.filterParams()
        }
      })
    }
  };

  this.getPrice = function(lunchItem, callback) {
    $.getJSON(self.fourSquareAPI.url + lunchItem.venueID, {
      // Query FourSquare API to get venue info (price)
      client_id: self.fourSquareAPI.client_id,
      client_secret: self.fourSquareAPI.client_secret,
      v: '20180827',
      format: "json"
    })
    .done(function(data) {
      try {
        // Pull price data from the API, add to object
        lunchItem.price = data.response.venue.price.tier;
        console.log("Newest item to add: " + JSON.stringify(lunchItem));
        callback(lunchItem.price);
      }
      catch(error) {
        console.log(error);
      }
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

    // Run function if user has places to choose from and < 5 current options
    else if (self.lunchSearch().length > 0 && self.lunchList().length < 5) {
      // Pop random item from data list
      var lunchItem = self.lunchSearch.splice(Math.floor(Math.random() * self.lunchSearch().length), 1)[0];
      // Add ID to new lunch item
      lunchItem.id = self.lunchList().length + 1;
      // Add lunch spot to option list
      self.lunchList.push(lunchItem);
      // Run create map marker function
      addLunch(lunchItem);
      // Run select lunch spot function
      self.selectSpot(lunchItem);

    // Notify user if they maxed-out their options
    } else {
      window.alert("No more options for you!");
    }

  };

  this.updatePrice = function(selected) {
    // if selected place's price is lower than the current max price parameter, update max price
    if(self.excludeParams().price <= 1 || selected.price <= 1) {
      self.excludeParams().price = 1;
      window.alert("That's as low as we can go! We'll search for another cheap place for you.");
    }
    else if (self.excludeParams().price > selected.price){
      self.excludeParams().price = parseInt(selected.price) - 1;
      console.log("New max price: " + self.excludeParams().price);
      // run getLunch function to get a new option with updated parameters
    } else {
      window.alert("The current max price is lower than this place! We'll search for another cheap place for you.");
    }
    // console.log(self.lunchList()[self.lunchList().length-1]);
    self.getLunch();
  }

  this.updateType = function(selected) {
    // if selected place's food type is not yet on the exlusions list, add it
    if (!self.excludeParams().types.includes(selected.type)) {
      self.excludeParams().types.push(selected.type);
      console.log("Updated food types to exclude: " + self.excludeParams().types);
      // run getLunch function to get a new option with updated parameters
      self.getLunch();
    } else {
      window.alert("We got you covered! Already excluding " + selected.type + " food options.");
    }
  }

}

ko.applyBindings(new ViewModel())