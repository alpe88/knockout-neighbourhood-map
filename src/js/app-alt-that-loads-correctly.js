"use strict";




    var map;
	var center;
	var defaultBounds;
	var placesServices;
			
	
	//LocationObject created to hold data for locations generated from google.places.nearbySearch
	var LocationObject = function(data){
		this.position = data.geometry.location;
		this.lat = data.geometry.location.lat;
		this.lng = data.geometry.location.lng;
		this.name = data.name;
		this.placeID = data.place_id;
		this.rating = data.rating;
		this.types = data.types;
		this.linkToPhoto = data.html_attributions;
	};
	
	var LocationObject = {};

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
	
	
		//ViewModel created to observe changes on the map
	var MapViewModel = function(){
		var self = this;
		self.testarr = ko.observableArray([
			{ firstName: 'Bert', lastName: 'Bertington' },
            { firstName: 'Charles', lastName: 'Charlesforth' },
            { firstName: 'Denise', lastName: 'Dentiste' }
		]);
		self.locations = ko.observableArray([]);
		self.markers = [];
		
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
					for (var i = 0; i <= 18; i++) {
						var marker = new google.maps.Marker({
							map: map,
							position: results[i].geometry.location,
							animation: google.maps.Animation.DROP
						});
						self.locations.push(new LocationObject(results[i]));
						self.markers.push(marker);console.log('Locations: ',results[i]);
					}console.log('Markers: ',self.markers);
				} else{
					alert("We were not able to find any nearby locations in this Neighbourhood.");
				}
			});
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
	