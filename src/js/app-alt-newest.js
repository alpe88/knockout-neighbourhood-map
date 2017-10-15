"use strict";

    var map;
	var center;
	var defaultBounds;
	var placesServices;
	var infoWindow;
	
	//ViewModel created to observe changes on the map
	var MapViewModel = function(){
		var self = this;
		
		self.markers = ko.observableArray([]);
		self.locations = ko.observableArray([]);

		//First we find nearby locations using the Google PlacesService api, if locations are found we create markers for each and we save each location.
		this.getNearbyLocations = function(){
			if(placesServices === undefined){
				placesServices = new google.maps.places.PlacesService(map);
			}
			
			var request = {
				location: center,
				radius: getBoundsRadius(defaultBounds),
				type: ['establishment']
			};
			
			placesServices.nearbySearch(request, function(results, status) {
				if (status === google.maps.places.PlacesServiceStatus.OK) {
					for (var i = 0; i <= 15; i++) {
						self.createMarkers(results[i]);
						self.saveLocation(results[i]);
					}console.log(self.markers());
				} else{
					alert("We were not able to find any nearby locations in this Neighbourhood.");
				}
			});
		};
		
		//Location objects from nearby search will be passed individually to this function to be saved in the ko observableArray.
		this.saveLocation = function(location){
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
			
			tempLocationObj.isClicked = ko.observable(false);
			console.log('This object is getting stored now: ',tempLocationObj);
			self.locations.push(tempLocationObj);
		};
		
		//This helper function will find a location in observableArray based on id passed as parameter.
		this.findLocationInObsArr = function(placeid, obsArr){
			return ko.utils.arrayFirst(obsArr, function(item) {
				return item.place_id === placeid;
			}) || 'not found';
		};
		
		//This helper function will get location details using Google PlacesService and update the object passed to it.
		this.getLocationDetails = function(location){
			placesServices.getDetails({
					placeId: location.place_id
			}, function(results, status){
				if (status == google.maps.places.PlacesServiceStatus.OK) {
					self.updateLocationObject(location, results);
				} else {
					alert('DEBUG: ', status);
				}
			});
		};
		
		//This helper function will update the location after it's found in array.
		this.updateLocationObject = function(locationObject, locationDetailResult){
			if (locationObject != null || locationObject == undefined) {
				locationObject.formatted_address = locationDetailResult.formatted_address;
				locationObject.formatted_phone_number = locationDetailResult.formatted_phone_number;
				locationObject.email = locationDetailResult.email;
			}else{
				alert("Location object could not be updated.");
			}
		};
		
		this.createMarkers = function(place){
			if(infoWindow === undefined){
				infoWindow = new google.maps.InfoWindow();
			}
			var marker = new google.maps.Marker({
				map: map,
				position: place.geometry.location,
				animation: google.maps.Animation.DROP,
				visible: true,
				place: {
					placeId: place.place_id,
					location: place.geometry.location
				}
				
			});
			google.maps.event.addListener(marker, 'click', function(){
				self.whenClicked(place.place_id);
			});
			self.markers.push(marker);
		};
		
		//Helper function that handles events post location click.
		this.whenClicked = function(place_id){
			//when item is clicked set content of infowindow and open info window.
			console.log('clickity', place_id);
			var location = self.findLocationInObsArr(place_id, self.locations());
			console.log('Found Location: ', location );
			//var marker = self.findLocationInObsArr(place_id, self.markers());
			//console.log('Found Marker: ', marker );

			var locationData = self.getLocationDetails(location);
				infoWindow.setContent('<div><p><strong>' + locationData.name + '</strong>' +
                ' is located at the following address: ' + locationData.formatted_address + '</p></div>');
				infoWindow.open(map, marker);

			
			
			/*var objectInArray = self.findLocationInObsArr(place_id);
			var locationObject;
			console.log('Found Object: ',objectInArray);
			if (!objectInArray.formatted_address.length){
				locationObject = self.getLocationDetails(objectInArray);
			}
				//self.showDetails();*/
		};
		
		this.showDetails = function(){
			
		};
		
		self.isLocationOpen = function(trigger){
			if(!trigger){
				return false;
			}else if(trigger){
				return true;
			}else{
				return false;
			}
		};
		
		this.init = function(){
			self.getNearbyLocations();
		};
	};
	
	setTimeout(function(){
		var myMapViewModel = new MapViewModel();
		myMapViewModel.init();
		ko.applyBindings(myMapViewModel); 
	}, 500);
		
		
		
		
	
	/* Utility Functions */
		
    function initMap(){
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
			new google.maps.LatLng(47.614217, -122.317981),new google.maps.LatLng(47.612975, -122.316291));
		map.fitBounds(defaultBounds);
		
		placesServices =  new google.maps.places.PlacesService(map);
	}
	
	function getBoundsRadius(bounds){
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
			Math.cos(c_lat) * Math.cos(ne_lat) * Math.cos(ne_lng - c_lng)
		)
		return r_km * 1000 // radius in meters
	}