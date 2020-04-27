const Router = require('express').Router;
const Client = require("@googlemaps/google-maps-services-js").Client;
var polyline = require('@mapbox/polyline');
var geometry = require('spherical-geometry-js');
const { check, validationResult } = require('express-validator');
require('dotenv').config( {path: '../../../../.env'} );

const client = new Client({});

module.exports = Router({mergeParams: true})
.get('/v1/trips/calculatetrip',
    [check('origin'),
    check('destination').optional(),
    check('radius').optional().isNumeric(),
    check('num_waypoints').isNumeric(),
    check('types').isString()],
    async (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {return res.status(422).json({ errors: errors.array() }) }
      try {
        var route = await calculateTrip(req.query);
        res.status(200).json(route);
      } catch(error) {
        req.logger.info({error: error});
        res.status(500).send(error);
      }
});

/*
 * Takes in a params object with the following parameters: origin, num_waypoints, types, and either destination or radius (in miles)
 * Calculates a route with a number of stops equal to num_waypoints
 * Returns a route object containing: origin, destination, and an array of waypoints. 
 * Check Google Maps docs for structure of waypoint object
*/
async function calculateTrip(params) {
    var origin = params.origin;
    var num_waypoints = parseInt(params.num_waypoints);
    var types = params.types == "" ? [] : params.types.split(',');
    types.push("tourist_attraction");
    // if only a radius is provided, calculate a random destination near edge of radius
    if ('destination' in params) {
      var destination = params.destination;
    }
    else if ('radius' in params) {
      destination = await calculateDestination(origin, parseInt(params.radius));
      num_waypoints--;
    }
    var initial_route = await client
    .directions({
      params: {
        origin: origin,
        destination: destination,
        key: process.env.GOOGLE_MAPS_API_KEY
      },
      timeout: 2000 // milliseconds
    });
    if (initial_route.data.status != "OK") {
      throw "Google maps error: " + initial_route.data.status;
    }
    var points = polyline.decode(initial_route.data.routes[0].overview_polyline.points); // array of lat/lng points
    var x = Math.floor(points.length/(num_waypoints+1)); // points array offset
    var trip_length = geometry.computeLength(points.map((point) => [point[1], point[0]]));
    var waypoints = [];
    var waypoint_radius = Math.min(Math.ceil((trip_length/(num_waypoints+1))/2), 50000); // how far out from each point we should search for a place (in meters), 805 = (1609 m)/2
    // Find all waypoints for trip
    for (let i = 1; i <= num_waypoints; i++) {
      var type = types[(i-1)%types.length];
      try {
        var waypoint = await findPlace(points[i*x], waypoint_radius, waypoints, origin, destination, type);
      } catch (e) {
        if (e == "Google maps error: ZERO_RESULTS") { // try one more time, with different type
          waypoint = await findPlace(points[i*x], waypoint_radius, waypoints, origin, destination, "tourist_attraction");
        } else {
          throw e;
        }
      }
      waypoints.push(waypoint);
    }
    return {
        'origin': origin,
        'destination': destination,
        'waypoints': waypoints
    };
  }
  

  async function findPlace(location, radius, waypoints, origin, destination, type) {
    var places = await client
      .placesNearby({
        params: {
          location: location,
          radius: radius,
          type: type, 
          key: process.env.GOOGLE_MAPS_API_KEY
        },
        timeout: 1000
      });
      if (places.data.status != "OK") {
        throw "Google maps error: " + places.data.status;
      }
      var i = 0;
      // prevent duplicates waypoints
      while (waypoints.some(w => w.name == places.data.results[i].name) || 
      places.data.results[i].name == origin ||
      places.data.results[i].name == destination) {
        i++;
      }
      return places.data.results[i];
  }


  async function calculateDestination(origin, radius) {
    var origin_details = await client
      .findPlaceFromText({
        params: {
          input: origin,
          inputtype: 'textquery',
          fields: 'geometry',
          key: process.env.GOOGLE_MAPS_API_KEY
        },
        timeout: 1000
      });
    if (origin_details.data.status != "OK") {
      throw "Google maps error: " + origin_details.data.status;
    }
    var origin_coords = origin_details.data.candidates[0].geometry.location;
    // Keep computing a different heading until we find a valid destination
    while (true) {
      try {
        var heading = Math.floor(Math.random() * 360); // Calculate random heading from origin
        var dest_coords = geometry.computeOffset(origin_coords, radius*1609, heading); // Compute random destination coordinates
        var dest = await findPlace([dest_coords.lat(), dest_coords.lng()], 30000, [], origin, "", "tourist_attraction"); // Get name of nearby destination
      } catch (e) {
        if (e ==  "Google maps error: ZERO_RESULTS") {
          console.log("Destination not found, retrying...");
          continue;
        } else {
          throw e;
        }
      }
      break;
    }
    return dest.name;
  }