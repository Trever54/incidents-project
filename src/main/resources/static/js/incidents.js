
// addresses to show on the map
var addresses = []
// Apparatus locations to show on the map
var apparatuses = []

/**
 * Set the request header for calls to the weather service
 * @param {*} xhr 
 */
function setMeteostatHeader(xhr) {
    xhr.setRequestHeader('x-api-key', 'HmkeDwKh8hmbjni9mjKqN7hzrAWKw0dG');
}

/**
 * Request data from the weather service for a specific location at a specific time
 * for a given timezone
 * @param {float} latitude 
 * @param {float} longitude 
 * @param {string} startDate 
 * @param {string} endDate 
 * @param {string} timeZone 
 */
function requestWeatherData(latitude, longitude, startDate, endDate, timeZone) {

    // create the params obj
    var data = {
        lat: latitude,
        lon: longitude,
        start: startDate,
        end: endDate,
        tz: timeZone
    }

    // url for weather data
    url = "https://api.meteostat.net/v2/point/hourly"

    // make a GET request to the weather service
    $.ajax({
        url: url,
        data: data,
        type: "GET",
        beforeSend: setMeteostatHeader,
        success: weatherRequestCallback
     });

}

/**
 * Callback method to handle response from the weather service
 * @param {*} response - the success response from the weather service
 */
function weatherRequestCallback(response) {
    console.log(response);
}

/**
 * Callback method to handle response from the incident service
 * @param {JSON} response - the success response from the incident service
 */
function incidentRequestCallback(response) {

    // parse to json
    var jsonResponse = JSON.parse(response);

    // address
    var newAddressPoint = createAddressPoint(jsonResponse.address);
    // TODO - race condition here right now, if the map loads before this the data won't be displayed
    addresses.push(newAddressPoint); 

    



    // weather ------------
    var latitude = jsonResponse.address.latitude;
    var longitude = jsonResponse.address.longitude;
    var eventOpened = jsonResponse.description.event_opened;
    var eventClosed = jsonResponse.description.event_closed;
    var startDate = eventOpened.split("T", 1)[0];
    var endDate = eventClosed.split("T", 1)[0];
    var timeZone = jsonResponse.fire_department.timezone;

    // request weather data to be displayed for this location
    // requestWeatherData(latitude, longitude, startDate, endDate, timeZone)  

    loadMap();


}

/**
 * Load the address point onto the map for this response
 * @param {JSON} jsonResponse 
 */
function createAddressPoint(addressJson) {

    var latitude = addressJson.latitude;
    var longitude = addressJson.longitude;
    var name = addressJson.name;
    var address = addressJson.address_line1 + ', ' + addressJson.city + ', ' + addressJson.state;

    var addressPoint = {
        // feature for Mapbox DC
        'type': 'Feature',
        'geometry': {
            'type': 'Point',
            // longitude, latitude
            'coordinates': [longitude, latitude]
        },
        'properties': {
            'title': name,
            'address': address
        }
    }

    return addressPoint;

}

function createApparatusPoint(apparatus) {

    

}

// GET to this service to get the incident to display
$.get("http://localhost:8080/incident", incidentRequestCallback);




// MapboxGL stuff below:
function loadMap() {

    // TODO - put this key in a config
    mapboxgl.accessToken = 'pk.eyJ1IjoidHJldmVybW9jayIsImEiOiJja2U1dDJpaHcxNXR1MnNwZHZ2NTJzY21iIn0.Mo-JC8_CVEFKjQT2Ty0OZg';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11'
    });

    // Actually load a point on the map (FRANKLIN address from data file)
    map.on('load', function () {
        // Add an image to use as a custom marker
        map.loadImage(
            'https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png',
            function (error, image) {
                if (error) throw error;
                map.addImage('custom-marker', image);

                // Add a GeoJSON source with point(s)
                map.addSource('addresses', {
                    'type': 'geojson',
                    'data': {
                        'type': 'FeatureCollection',
                        'features': addresses
                    }
                });

                // Address icons to the map
                map.addLayer({
                    'id': 'addresses',
                    'type': 'symbol',
                    'source': 'addresses',
                    'layout': {
                        'icon-image': 'custom-marker',
                        // get the title name from the source's "title" property
                        'text-field': ['get', 'title'],
                        'text-font': [
                            'Open Sans Semibold',
                            'Arial Unicode MS Bold'
                        ],
                        'text-offset': [0, 1.25],
                        'text-anchor': 'top'
                    }
                });
            }
        );
    });

    map.on('click', function(e) {
        var features = map.queryRenderedFeatures(e.point, {
            layers: ['addresses'] // replace this with the name of the layer
        });
    
        // if no features, return
        if (!features.length) {
            return;
        }
    
        var feature = features[0];
    
        var popup = new mapboxgl.Popup({ offset: [0, -15] })
            .setLngLat(feature.geometry.coordinates)
            .setHTML('<h3>' + feature.properties.title + '</h3>'
                + '<p><b>Address:</b><br>' + feature.properties.address + '</br></p>')
            .addTo(map);
    });

}
