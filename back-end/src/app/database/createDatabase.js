const mongoose = require('mongoose')
const glob = require('glob')
const path = require('path')
require('dotenv').config( {path: './.env'} )


module.exports = ({ logger }) => {
    const url = process.env.MONGODB_URL
    console.log(url)
    mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true})
    const db = glob.sync('./mongoSchemas/*.js', { cwd: __dirname })
    .map(filename => {
        return {
            schema: require(filename),
            name: path
                .basename(filename)
                .replace(path.extname(filename), ''),
        }
    })
    .map(({name, schema}) => mongoose.model(name, schema))
    .reduce((db, model) => {
        return {
            ...db,
            [model.modelName]: model,
        }
    }, {})
    mongoose
    .connection
    .on('error', error => {
        throw error
    })
    .once('open', () => logger.info(`MongoDB connected at ${url}`))

    db.mongoose = mongoose
    return db
}