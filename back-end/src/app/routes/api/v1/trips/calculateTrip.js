const Router = require('express').Router;
const Client = require("@googlemaps/google-maps-services-js").Client;
var polyline = require('@mapbox/polyline');
var geometry = require('spherical-geometry-js');
require('dotenv').config( {path: '../../../../.env'} );

const client = new Client({});

module.exports = Router({mergeParams: true})
.get('/v1/trips/calculatetrip', async (req, res, next) => {
    try {
        var route = await calculateTrip(req.query);
        res.header('Access-Control-Allow-Origin', '*'); // Only way I've found to prevent cors error
        res.status(200).json(route);
    } catch(error) {
        next(error)
    }
});

/*
 * Takes in a params object with the following parameters: origin, num_waypoints, and either destination or radius (in miles)
 * Calculates a route with a number of stops equal to num_waypoints
 * Returns a route object containing: origin, destination, and an array of waypoints. 
 * Check Google Maps docs for structure of waypoint object
*/
async function calculateTrip(params) {
    var origin = params.origin;
    var num_waypoints = params.num_waypoints;
    // if only a radius is provided, calculate a random destination near edge of radius
    var destination = 'destination' in params ? params.destination : await calculateDestination(origin, params.radius);
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
    var x = Math.floor(points.length/num_waypoints);
    var waypoints = [];
    var waypoint_radius = 50000; // how far out from each point we should search for a place
    for (let i = x; i < points.length; i += x) {
      var waypoint = await findPlace(points[i], waypoint_radius, waypoints);
      waypoints.push(waypoint);
    }
    return {
        'origin': origin,
        'destination': destination,
        'waypoints': waypoints
    };
  }
  

  // TODO: Function should accept a list of types
  async function findPlace(location, radius, waypoints) {
    var places = await client
      .placesNearby({
        params: {
          location: location,
          radius: radius,
          type: "tourist_attraction",  // Type will vary depending on user input
          key: process.env.GOOGLE_MAPS_API_KEY
        },
        timeout: 1000
      });
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
      var dest = await findPlace([dest_coords.lat(), dest_coords.lng()], 30000, []); // Get name of nearby destination
      return dest.name;
  }