"use strict";

var map;
var center;
var defaultBounds;
var placesServices;
var infoWindow;

//ViewModel created to observe changes on the map
var MapViewModel = function () {
	var self = this;

	self.locations = ko.observableArray([]);

	//First we find nearby locations using the Google PlacesService api, if locations are found we create markers for each and we save each location.
	this.getNearbyLocations = function () {
		if (placesServices === undefined) {
			placesServices = new google.maps.places.PlacesService(map);
		}

		var request = {
			location: center,
			radius: getBoundsRadius(defaultBounds),
			type: ['establishment']
		};

		placesServices.nearbySearch(request, function (results, status) {
			if (status === google.maps.places.PlacesServiceStatus.OK) {
				for (var i = 0; i <= 5; i++) {
					self.saveLocation(results[i], self.createMarker(results[i]));
				}
			} else {
				alert("We were not able to find any nearby locations in this Neighbourhood.");
			}
		});
	};

	//Location objects from nearby search will be passed individually to this function to be saved in the ko observableArray.
	this.saveLocation = function (location, marker) {
		var tempLocationObj = {};
		tempLocationObj.position = location.geometry.location;
		tempLocationObj.lat = location.geometry.location.lat;
		tempLocationObj.lng = location.geometry.location.lng;
		tempLocationObj.name = location.name;
		tempLocationObj.place_id = location.place_id;
		tempLocationObj.rating = location.rating;
		tempLocationObj.types = location.types;
		tempLocationObj.business_hours = location.opening_hours.open_now;

		tempLocationObj.formatted_address = "";
		tempLocationObj.formatted_phone_number = "";
		tempLocationObj.email = "";

		tempLocationObj.marker = marker;
		tempLocationObj.photos = "";

		console.log('This object is getting stored now: ', tempLocationObj);
		self.locations.push(tempLocationObj);
	};

	//This helper function will find a location in observableArray based on id passed as parameter.
	this.findLocationInObsArr = function (placeid, obsArr) {
		return ko.utils.arrayFirst(obsArr, function (item) {
			return item.place_id === placeid;
		}) || 'not found';
	};

	//This helper function will get location details using Google PlacesService and update the object passed to it.
	this.getLocationDetails = function (location) {
		placesServices.getDetails({
			placeId: location.place_id
		}, function (results, status) {
			if (status == google.maps.places.PlacesServiceStatus.OK) {
				self.updateLocationObject(location, results);
			} else {
				alert('DEBUG: ', status);
			}
		});
	};

	//This helper function will update the location after it's found in array.
	this.updateLocationObject = function (locationObject, locationDetailResult) {
		if (locationObject != null || locationObject === undefined) {
			locationObject.formatted_address = locationDetailResult.formatted_address;
			locationObject.formatted_phone_number = locationDetailResult.formatted_phone_number;
			locationObject.email = locationDetailResult.email;
		} else {
			alert("Location object could not be updated.");
		}
	};

	this.createMarker = function (place) {
		if (infoWindow === undefined) {
			infoWindow = new google.maps.InfoWindow();
		}
		var marker = new google.maps.Marker({
				map: map,
				position: place.geometry.location,
				animation: google.maps.Animation.DROP,
				visible: true,
				place_id: place.place_id
			});
		google.maps.event.addListener(marker, 'click', function () {
			self.whenClicked(place.place_id);
		});
		return marker;
	};

	//Helper function that handles events post location click.
	this.whenClicked = function (place_id) {
		//when item is clicked set content of infowindow and open info window.
		console.log('clickity', place_id);
		var location = self.findLocationInObsArr(place_id, self.locations());
		self.getLocationDetails(location);
		console.log('Found Location: ', location);

		var marker = location.marker;
		console.log('Found Marker: ', marker);

		var photos = self.getFlickrPhotos(location, location.name);

		marker.setAnimation(google.maps.Animation.BOUNCE);
		setTimeout(function () {
			self.showDetails(location, marker);
		}, 200);
		setTimeout(function () {
			marker.setAnimation(null);
		}, 450);
	};

	self.showDetails = function (location, marker) {
		infoWindow.setContent('<div><p><strong>' + location.name + '</strong>' +
			' is located at the following address: ' + location.formatted_address + '. Call Now: ' + location.formatted_phone_number + '!</p>' + location.photos + '</div>');
		infoWindow.open(map, marker);
	};

	self.isLocationOpen = function (trigger) {
		if (!trigger) {
			return false;
		} else if (trigger) {
			return true;
		} else {
			return false;
		}
	};

	/* Search and Filtering */

	self.filter = ko.observable("");

	/*Function credit:
	https://stackoverflow.com/questions/45422066/set-marker-visible-with-knockout-js-ko-utils-arrayfilter*/
	this.filteredSearch = ko.computed(function () {
			return self.locations().filter(function (location) {
				if (!self.filter()) {
					ko.utils.arrayForEach(self.locations(), function (location) {
						location.marker.setVisible(true);
					});
					return self.locations();
				} else {
					return ko.utils.arrayFilter(self.locations(), function (location) {
						var result = (location.name.toLowerCase().indexOf(self.filter().toLowerCase()) !== -1);
						location.marker.setVisible(result);
						return result;
					});
				}
			});
		});

	this.getFlickrPhotos = function (location, flickrSearchQuery) {
		var apikey = '51cfa0502588646dbecd813c70178ca4';
		flickrSearchQuery += ' in Seattle, Washington';
		var url = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&' +
			'api_key=' + apikey + '&text=' + flickrSearchQuery + '&format=json&per_page=1&' +
			'sort=relevance&privacy_filter=1&nojsoncallback=1';

		$.getJSON(url, function (data) {
			var $photos = data.photos.photo;
			var html = '';
			$photos.forEach(function (photo) {
				if (photo != undefined) {
					var result = self.convertFlickrResult(photo);
					html = '<img style="width:200px;" class="img-thumbnail d-block" src="' + result.src + '" alt="' + result.alt + '">';
					location.photos = html;
					console.log(location.photos);
				} else {
					html = '<em>No photo available at this time.</em>';
					location.photos = html;
				}
			});
		}).fail(function () {
			alert("Sorry, there was an issue loading photos from flickr!");
		});
	};

	this.convertFlickrResult = function (data) {
		var photoObj = {};
		photoObj.baseURL = "http://farm" + data.farm + ".static.flickr.com/" + data.server + "/" + data.id + "_" + data.secret;
		photoObj.mobileSrc = photoObj.baseURL + "_m.jpg";
		photoObj.title = data.title;
		photoObj.src = photoObj.baseURL + ".jpg";
		return photoObj;
	};

	this.init = function () {
		self.getNearbyLocations();
	};
};

setTimeout(function () {
	var myMapViewModel = new MapViewModel();
	myMapViewModel.init();
	ko.applyBindings(myMapViewModel);
}, 500);

/* Utility Functions */

function initMap() {
	center = new google.maps.LatLng(47.613581, -122.316698);
	map = new google.maps.Map(document.getElementById('map'), {
			center: center,
			zoom: 17,
			mapTypeId: 'satellite',
			draggable: true,
			zoomControl: false,
			scrollwheel: true,
			disableDoubleClickZoom: true
		});
	defaultBounds = new google.maps.LatLngBounds(
			new google.maps.LatLng(47.614217, -122.317981), new google.maps.LatLng(47.612975, -122.316291));
	map.fitBounds(defaultBounds);

	placesServices = new google.maps.places.PlacesService(map);
}

function getBoundsRadius(bounds) {
	/* Function credit: https://stackoverflow.com/questions/3525670/radius-of-viewable-region-in-google-maps-v3 */
	// r = radius of the earth in km
	var r = 6378.8
		// degrees to radians (divide by 57.2958)
		var ne_lat = bounds.getNorthEast().lat() / 57.2958
		var ne_lng = bounds.getNorthEast().lng() / 57.2958
		var c_lat = bounds.getCenter().lat() / 57.2958
		var c_lng = bounds.getCenter().lng() / 57.2958
		// distance = circle radius from center to Northeast corner of bounds
		var r_km = r * Math.acos(
			Math.sin(c_lat) * Math.sin(ne_lat) +
			Math.cos(c_lat) * Math.cos(ne_lat) * Math.cos(ne_lng - c_lng))
		return r_km * 1000 // radius in meters
}
