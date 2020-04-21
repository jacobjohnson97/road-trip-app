const Router = require('express').Router
const { check, validationResult } = require('express-validator');

/*
 * This endpoint authenticates a user and returns a jwt
 */
module.exports = Router({mergeParams: true})
.post('/login',
	[check('email').isEmail(),
    check('password')],
    async (req, res, next) => {

	const errors = validationResult(req);
    if (!errors.isEmpty()) {return res.status(422).json({ errors: errors.array() }) }

    const email = req.body.email;
    const password = req.body.password;

    const user = await req.db.Users.findOne({'email': email})

    if(user.comparePassword(password)){
    	user.newToken();

    	res.send({'token': user.token});
    }else{
    	res.sendStatus(403)
    }
})