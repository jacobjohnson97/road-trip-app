const mongoose = require('mongoose')

const { Schema } = mongoose;

const destinationSchema = new Schema({
	name: String,
	location: String,
	yelpRating: Number,
})




const tripSchema = new Schema({
	user: String,
	destinations: [destinationSchema]
	
})



// Compile the model
module.exports = destinationSchema;
module.exports = tripSchema;