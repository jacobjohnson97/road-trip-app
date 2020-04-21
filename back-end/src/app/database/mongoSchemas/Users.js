const mongoose = require('mongoose');
const security = require('../../lib/security');

const { Schema } = mongoose;

const userSchema = new Schema({

	email: {
        type: String,
        unique: true,
        required: 'Your email is required',
    },

    password: {
        type: String,
    },

    salt: {
        type: String,
    },

	last_login: {
		type: String,
	},
})

userSchema.methods.comparePassword = function(password) {
    if(this.password === security.genHash(password, this.salt)){return true}
    else {return false}
}

userSchema.methods.newPassword = function(password) {
	this.password = security.genHash(password, this.salt)
}

userSchema.methods.newSalt = function(){
	this.salt = security.genuuid()
}

// Generate a new JWT token
userSchema.methods.newToken = function(){
	this.last_login = new Date().toISOString();

	let payload = {
		email: this.email, 
		last_login: this.last_login
	}

	this.token = security.createToken(payload);
}

userSchema.methods.sayHello = function () {
    return `This is a shared function: ${this.email}`;
}

// Compile the model
module.exports = userSchema;