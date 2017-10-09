//app.js
"use strict";

function MapAppViewModel() {
	var self = this;
    self.myMap = ko.observable({
        lat: ko.observable(47.613581),
        lng: ko.observable(-122.316698),
		locations: ko.observableArray([])
	});
}

var myMapAppViewModel = new MapAppViewModel();

ko.bindingHandlers.map = {

    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var mapObj = ko.utils.unwrapObservable(valueAccessor());
        var latLng = new google.maps.LatLng(
            ko.utils.unwrapObservable(mapObj.lat),
            ko.utils.unwrapObservable(mapObj.lng));
		var locations = ko.utils.unwrapObservable(mapObj.locations)
        var mapOptions = { 
			center: latLng,
            zoom: 19, 
            mapTypeId: google.maps.MapTypeId.SATELITE,
			draggable: true, 
			zoomControl: false, 
			scrollwheel: true, 
			disableDoubleClickZoom: true,
		};	
		mapObj.googleMap = new google.maps.Map(element, mapOptions);
		
		var placesService = new google.maps.places.PlacesService(mapObj.googleMap);
		var defaultBounds = new google.maps.LatLngBounds(
			new google.maps.LatLng(47.614217, -122.317981),new google.maps.LatLng(47.612975, -122.316291)
		);
		var request = {
			location: latLng,
			radius: getBoundsRadius(defaultBounds),
			type: ['establishment']
		};
		
		placesService.nearbySearch(request, function(results, status) {
			if (status === google.maps.places.PlacesServiceStatus.OK) {
				for (var i = 0; i <= 18; i++) {
					var marker = new google.maps.Marker({
						map: mapObj.googleMap,
						position: results[i].geometry.location,
						animation: google.maps.Animation.DROP
					});
					locations.push(results[i]);console.log(results[i]);
				}
			}
		});
		
		$("#" + element.getAttribute("id")).data("mapObj",mapObj);
    }
};
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
// Activates knockout.js
ko.applyBindings(myMapAppViewModel);