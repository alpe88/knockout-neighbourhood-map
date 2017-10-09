"use strict";




    var map;
    var infowindow;
	  

	  
    function initMap() {
       var center = {lat: 47.613581, lng: -122.316698};

       map = new google.maps.Map(document.getElementById('map'), {
		center: center,
		zoom: 17,
		mapTypeId: 'satellite',
		draggable: true, 
		zoomControl: false, 
		scrollwheel: true, 
		disableDoubleClickZoom: true
    });
		
			  
	var defaultBounds = new google.maps.LatLngBounds(
		new google.maps.LatLng(47.614217, -122.317981),new google.maps.LatLng(47.612975, -122.316291));
			
	map.fitBounds(defaultBounds);

    infowindow = new google.maps.InfoWindow();
    var service = new google.maps.places.PlacesService(map);
		service.nearbySearch({
			location: center,
			radius: getBoundsRadius(defaultBounds),
			type: ['establishment'],
        }, callback);
    }

    function callback(results, status) {
		if (status === google.maps.places.PlacesServiceStatus.OK) {
			for (var i = 0; i <= 18; i++) {
				createMarker(results[i]);
			}
        }
    }

    function createMarker(place) {
		var marker = new google.maps.Marker({
			map: map,
			position: place.geometry.location,
			animation: google.maps.Animation.DROP
        });
		
		console.log(place);

		google.maps.event.addListener(marker, 'click', function() {
			infowindow.setContent(place.name);
			infowindow.open(map, this);
			map.setZoom(map.getZoom() + 1)
			map.setCenter(marker.getPosition());
        });
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
