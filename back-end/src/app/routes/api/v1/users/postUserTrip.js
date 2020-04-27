require('module-alias/register')
const Router = require('express').Router;
const { check, validationResult } = require('express-validator');
const verify = require('@security').verifyToken;

/*
 * This endpoint adds a user's trip to the database
 */
module.exports = Router({mergeParams: true})
.post('/trip', [check('trip').isAscii()], verify, async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {return res.status(422).json({ errors: errors.array() }) }
    const trip = req.body.trip;
    const user = await req.db.Users.findOne({'email': req.token.user.email});
	
    console.log()

    if(user){
    	user.trips.push({'trip': JSON.parse(trip)});
		  const updated = await user.save();
      res.status(200).json({ status: 'OK' });
    }else{
    	req.logger.info({error: "User not found."})
      res.status(404).json({ message: 'Not Found' });
    }
})