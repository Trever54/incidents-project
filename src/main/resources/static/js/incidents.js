
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
    var newIncidentPoint = createPoints(jsonResponse);

    // weather ------------
    var latitude = jsonResponse.address.latitude;
    var longitude = jsonResponse.address.longitude;
    var eventOpened = jsonResponse.description.event_opened;
    var eventClosed = jsonResponse.description.event_closed;
    var startDate = eventOpened.split("T", 1)[0];
    var endDate = eventClosed.split("T", 1)[0];
    var timeZone = jsonResponse.fire_department.timezone;

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
        var features = map.queryRenderedFeatures(e.point, {
            layers: ['incidents'] // replace this with the name of the layer
        });
    
        // if no features, return
        if (!features.length) {
            return;
        }
    
        var feature = features[0];

        // get vars to populate the popup with
        var json = JSON.parse(feature.properties.json);
        var address = json.address.address_line1 + ', ' + json.address.city + ', ' + json.address.state;
        var crossStreets = json.address.cross_street1 + " and " + json.address.cross_street2;
        // description
        var comments = json.description.comments;
        var dayOfWeek = json.description.day_of_week;
        var eventId = json.description.eventId;
        var eventOpened = json.description.eventOpened;
        var eventClosed = json.description.eventClosed;
        var incidentNumber = json.description.incidentNumber;
        var subtype = json.description.subtype;
        var type = json.description.type;
        
        var popup = new mapboxgl.Popup({ offset: [0, -15] })
            .setLngLat(feature.geometry.coordinates)
            .setHTML('<h3>' + feature.properties.title + '</h3>'
                + '<p><b>Address:</b><br>' + address + '</br></p>'
                )
            .addTo(map);
    });

}

// GET to this service to get the incident to display
$.get("http://localhost:8080/incident", incidentRequestCallback);
