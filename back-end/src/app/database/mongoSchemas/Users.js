const mongoose = require('mongoose')

const { Schema } = mongoose;

const userSchema = new Schema({
	email: String,
	password: String,
	token: String,
	last_login: String,
})



// Compile the model
module.exports = userSchema;