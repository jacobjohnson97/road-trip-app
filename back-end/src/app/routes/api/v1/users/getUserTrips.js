require('module-alias/register')
const Router = require('express').Router;
const { check, validationResult } = require('express-validator');
const verify = require('@security').verifyToken;

/*
 * This endpoint get a user's trip to the database. 
 * If given and ID the trip is returned else all trips are returned
 */
module.exports = Router({mergeParams: true})
.get('/trip', verify, async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {return res.status(422).json({ errors: errors.array() }) }
    const tripID = req.query.tripID;
    const user = await req.db.Users.findOne({'email': req.token.user.email});

    req.logger.info(req.token)
    req.logger.info(user)
	
    if(!user){
        req.logger.info({error: "User not found."});
        res.sendStatus(404);
        return;
    }

    if(tripID){
        res.send(user.trips.tripID)
    }else{
        res.send(user.trips)
        
    }
    
})