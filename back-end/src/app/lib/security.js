const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const niceware = require('niceware');

const uuidFromBytes = (rnd) => {
  rnd[6] = (rnd[6] & 0x0f) | 0x40;
  rnd[8] = (rnd[8] & 0x3f) | 0x80;
  rnd = rnd.toString('hex').match(/(.{8})(.{4})(.{4})(.{4})(.{12})/);
  rnd.shift();
  return rnd.join('-');
};

const getToken = (req) => {
  return typeof (req.headers['auth-token']) != "undefined" ? req.headers['auth-token'] : typeof (req.query.token) != "undefined" ? req.query.token : typeof (req.body) != "undefined" ? req.body.token : "";
}

module.exports = {
  genPassword: () => {
    // Generate an 8 byte password
    return niceware.generatePassphrase(8).map( elem => { return elem }).join("-")
  },

  genHash: (password, salt) => {
    const sum = crypto.createHash('sha256');
    sum.update(password + salt);
    return sum.digest('base64');
  },

  genuuid: (callback) => {
    if (typeof (callback) !== 'function') {
      return uuidFromBytes(crypto.randomBytes(16));
    }

    crypto.randomBytes(16, (err, rnd) => {
      if (err) { return callback(err); }
      callback(null, uuidFromBytes(rnd));
    });
  },

  createToken: (user) => {
        return jwt.sign({user}, process.env.SUPER_SECRET.toString('base64'), { expiresIn: process.env.TOKEN_EXPIRES_IN});
  },

  verifyToken: (req, res, next) =>{ 
    //req.token = getToken(req)

    // Format of token => Authorization: Bearer <access_token>
    // Get the auth header value
    const bearerHeader = req.headers['authorization']

    // Check if undefined
    if(typeof bearerHeader === 'undefined'){
      res.sendStatus(403)
      return
    }

    // Get the bearer token
    const token = bearerHeader.split(' ')[1]

    jwt.verify(token, process.env.SUPER_SECRET, async (err, authData) =>{

      // If there is an error, token is invalid
      if(err){
        res.sendStatus(403);
        return;
      }else{
        req.token = authData;
        next();
      }
    })
  },
};
