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
          next(error)
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
    var destination = 'destination' in params ? params.destination : await calculateDestination(origin, parseInt(params.radius));
    var initial_route = await client
    .directions({
      params: {
        origin: origin,
        destination: destination,
        key: process.env.GOOGLE_MAPS_API_KEY
      },
      timeout: 2000 // milliseconds
    });
    var points = polyline.decode(initial_route.data.routes[0].overview_polyline.points);
    var x = Math.floor(points.length/(num_waypoints+1));
    var waypoints = [];
    var waypoint_radius = 50000; // how far out from each point we should search for a place
    for (let i = 1; i <= num_waypoints; i++) {
      var type = types[(i-1)%types.length];
      var waypoint = await findPlace(points[i*x], waypoint_radius, waypoints, type);
      waypoints.push(waypoint);
    }
    return {
        'origin': origin,
        'destination': destination,
        'waypoints': waypoints
    };
  }
  

  async function findPlace(location, radius, waypoints, type) {
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
      if (places.status == "ZERO_RESULTS") {
        throw "Zero results founds";
      }
      var i = 0;
      // prevent duplicates waypoints
      while (waypoints.includes(places.data.results[i])) {
        i++;
      }
      return places.data.results[i];
  }


  async function calculateDestination(origin, radius) {
      var heading = Math.floor(Math.random() * 360); // Calculate random heading from origin
      // TODO: Assumes origin is the name of a place, need to handle case of lat/lng coords
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
      var origin_coords = origin_details.data.candidates[0].geometry.location;
      var dest_coords = geometry.computeOffset(origin_coords, radius*1609, heading); // Compute random destination coordinates
      var dest = await findPlace([dest_coords.lat(), dest_coords.lng()], 30000, [], "tourist_attraction"); // Get name of nearby destination
      return dest.name;
  }