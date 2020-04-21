require('module-alias/register')
const Router = require('express').Router
const { check, validationResult } = require('express-validator');
const verify = require('@security').verifyToken;

/*
 * This endpoint check if a jwt is valid. For test only!
 */
module.exports = Router({mergeParams: true})
.post('/token', verify, async (req, res, next) => {
    res.sendStatus(202)
})