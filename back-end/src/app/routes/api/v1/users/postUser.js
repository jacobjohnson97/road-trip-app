const Router = require('express').Router;
const { check, validationResult } = require('express-validator');

/*
 * This endpoint adds a user to the database
 */
module.exports = Router({mergeParams: true})
.post('/register', 
	[check('email').isEmail(),
    check('password')],
    async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {return res.status(422).json({ errors: errors.array() }) }

    const email = req.body.email;
    const password = req.body.password;

    try {
        const user = new req.db.Users({
            email: req.body.email,
        });
        
        user.newSalt();
        user.newPassword(req.body.password);
        user.newToken();

        await user.save();

        res.status(201).send({'token': user.token});
    } catch(error) {
        next(error);
    }



})