
// addresses to show on the map
var incidents = []
// Apparatus locations to show on the map
var apparatuses = []

/**
 * Callback method to handle response from the incident service
 * @param {JSON} response - the success response from the incident service
 */
function incidentRequestCallback(response) {

    // parse to json
    var jsonResponse = JSON.parse(response);

    // address
    createPoints(jsonResponse);

    // load the MapboxGL map
    loadMap();

}

/**
 * Load the address point onto the map for this response
 * @param {JSON} jsonResponse 
 */
function createPoints(json) {

    // lat and lon
    var latitude = json.address.latitude;
    var longitude = json.address.longitude;
    var name = json.address.name;

    // create point for incident
    var incidentPoint = {
        // feature for Mapbox DC
        'type': 'Feature',
        'geometry': {
            'type': 'Point',
            // longitude, latitude
            'coordinates': [longitude, latitude]
        },
        'properties': {
            'title': name,
            'json': json
        }
    }

    // add incident point
    incidents.push(incidentPoint); 

    // create points for each apparatus
    var apparatusArray = json.apparatus;
    apparatusArray.forEach(function(apparatus) {
        createApparatusPoints(apparatus);
    })

}

/**
 * Function that creates the apparatus points for
 * some incident
 * @param {JSON} apparatus - a single apparatus json object
 */
function createApparatusPoints(apparatus) {
    
    // loop through each status to get our points
    var status = apparatus.unit_status;
    var carId = apparatus.car_id;

    if (status.acknowledged) {
        var acknowledgedStatusPoint = {
            // feature for Mapbox DC
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                // longitude, latitude
                'coordinates': [status.acknowledged.longitude, status.acknowledged.latitude]
            },
            'properties': {
                'title': "Acknowledged: " + carId,
                'json': apparatus,
                'timestamp': status.acknowledged.timestamp
            }
        }
        apparatuses.push(acknowledgedStatusPoint);
    }
    
    if (status.arrived) {
        var arrivedStatusPoint = {
            // feature for Mapbox DC
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                // longitude, latitude
                'coordinates': [status.arrived.longitude, status.arrived.latitude]
            },
            'properties': {
                'title': "Arrived: " + carId,
                'json': apparatus,
                'timestamp': status.arrived.timestamp
            }
        }
        apparatuses.push(arrivedStatusPoint);
    }

    if (status.available) {
        var availableStatusPoint = {
            // feature for Mapbox DC
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                // longitude, latitude
                'coordinates': [status.available.longitude, status.available.latitude]
            },
            'properties': {
                'title': "Available: " + carId,
                'json': apparatus,
                'timestamp': status.available.timestamp
            }
        }
        apparatuses.push(availableStatusPoint);
    }
    
    if (status.cleared) {
        var clearedStatusPoint = {
            // feature for Mapbox DC
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                // longitude, latitude
                'coordinates': [status.cleared.longitude, status.cleared.latitude]
            },
            'properties': {
                'title': "Cleared: " + carId,
                'json': apparatus,
                'timestamp': status.cleared.timestamp
            }
        }
        apparatuses.push(clearedStatusPoint);
    }
    
    if (status.dispatched) {
        var dispatchedStatusPoint = {
            // feature for Mapbox DC
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                // longitude, latitude
                'coordinates': [status.dispatched.longitude, status.dispatched.latitude]
            },
            'properties': {
                'title': "Dispatched: " + carId,
                'json': apparatus,
                'timestamp': status.dispatched.timestamp
            }
        }
        apparatuses.push(dispatchedStatusPoint);
    }
    
    if (status.enroute) {
        var enrouteStatusPoint = {
            // feature for Mapbox DC
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                // longitude, latitude
                'coordinates': [status.enroute.longitude, status.enroute.latitude]
            },
            'properties': {
                'title': "Enroute: " + carId,
                'json': apparatus,
                'timestamp': status.enroute.timestamp
            }
        }
        apparatuses.push(enrouteStatusPoint);
    }

}

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

                // add images
                map.addImage('custom-marker', image);
                map.addImage('apparatus-marker', image)

                // Add incidents source
                map.addSource('incidents', {
                    'type': 'geojson',
                    'data': {
                        'type': 'FeatureCollection',
                        'features': incidents
                    }
                });

                // Add apparatuses source
                map.addSource('apparatuses', {
                    'type': 'geojson',
                    'data': {
                        'type': 'FeatureCollection',
                        'features': apparatuses
                    }
                });

                // Apparatuses icons to the map
                map.addLayer({
                    'id': 'apparatuses',
                    'type': 'symbol',
                    'source': 'apparatuses',
                    'layout': {
                        'icon-image': 'custom-marker',
                        // get the title name from the source's "title" property
                        'text-field': ['get', 'title'],
                        'text-font': [
                            'Open Sans Regular',
                            'Arial Unicode MS Regular'
                        ],
                        'text-offset': [0, 1.25],
                        'text-anchor': 'top'
                    }
                });

                // Incident icons to the map
                // TODO - this layer goes second because otherwise some of the
                // points will override the incident point. Not sure how to handle that.
                map.addLayer({
                    'id': 'incidents',
                    'type': 'symbol',
                    'source': 'incidents',
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

        // incidents
        var features = map.queryRenderedFeatures(e.point, {
            layers: ['incidents']
        });
        // only create popup if features exist
        if (features.length) {
            createPopupForIncidents(features, map);
        }

        // apparatuses
        var features = map.queryRenderedFeatures(e.point, {
            layers: ['apparatuses']
        });
        // only create popup if features exist
        if (features.length) {
            createPopupForApparatus(features, map);
        }
        
    });

}

/**
 * Creates the popup for an incident
 * @param {JSON} features 
 */
function createPopupForIncidents(features, map) {
    var feature = features[0];

    // get vars to populate the popup with
    var json = JSON.parse(feature.properties.json);
    var address = json.address.address_line1 + ', ' + json.address.city + ', ' + json.address.state;
    // description
    var eventOpened = json.description.event_opened;
    var eventClosed = json.description.event_closed;
    var type = json.description.type;
    // fire department
    var fireDepartmentName = json.fire_department.name;
    // weather (only fill with first entry)
    var weather;
    if (json.weather[0]) {
        var temp = "temp: " + json.weather[0].temp + ", ";
        var dwpt = "dwpt: " + json.weather[0].dwpt + ", ";
        var rhum = "rhum: " + json.weather[0].rhum + ", ";
        var prcp = "prcp: " + json.weather[0].prcp + ", ";
        var snow = "snow: " + json.weather[0].snow + ", ";
        var wdir = "wdir: " + json.weather[0].wdir + ", ";
        var wspd = "wspd: " + json.weather[0].wspd + ", ";
        var wpgt = "wpgt: " + json.weather[0].wpgt + ", ";
        var pres = "pres: " + json.weather[0].pres + ", ";
        weather = temp + dwpt + rhum + prcp + snow + wdir + wspd + wpgt + pres
    } else {
        weather = "No weather data found."
    }
    
    var popup = new mapboxgl.Popup({ offset: [0, -15] })
        .setLngLat(feature.geometry.coordinates)
        .setHTML('<h3>' + feature.properties.title + '</h3>'
            + '<p><b>Start Time:</b><br>' + eventOpened + '</br></p>'
            + '<p><b>End Time:</b><br>' + eventClosed + '</br></p>'
            + '<p><b>Address:</b><br>' + address + '</br></p>'
            + '<p><b>Fire Department:</b><br>' + fireDepartmentName + '</br></p>'
            + '<p><b>Type:</b><br>' + type + '</br></p>'
            + '<p><b>Weather:</b><br>' + weather + '</br></p>'
        )
        .addTo(map);
}

/**
 * Creates the popup for an apparatus unit status
 * @param {JSON} features 
 */
function createPopupForApparatus(features, map) {
    var feature = features[0];

    // get vars to populate the popup with
    var json = JSON.parse(feature.properties.json);
    var carId = json.car_id;
    var shift = json.shift;
    var station = json.station;
    var unitId = json.unit_id;
    var unitType = json.unit_type;
    var timestamp = feature.properties.timestamp;

    var popup = new mapboxgl.Popup({ offset: [0, -15] })
        .setLngLat(feature.geometry.coordinates)
        .setHTML('<h3>' + feature.properties.title + '</h3>'
            + '<p><b>Timestamp:</b><br>' + timestamp + '</br></p>'
            + '<p><b>Car ID:</b><br>' + carId + '</br></p>'
            + '<p><b>Shift:</b><br>' + shift + '</br></p>'
            + '<p><b>Station:</b><br>' + station + '</br></p>'
            + '<p><b>Unit ID:</b><br>' + unitId + '</br></p>'
            + '<p><b>Unit Type:</b><br>' + unitType + '</br></p>'
        )
        .addTo(map);

}

// GET to this service to get the incident to display
$.get("http://localhost:8080/incident", incidentRequestCallback);
