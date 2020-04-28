/*
const mongoose = require('mongoose');
const { Config } = require('../lib/config');
const consoleLog = require('../lib/consolelog');

const dbURI = process.env.MONGO_DB;
const dbBigDataURI = process.env.MONGO_DB_BIG_DATA;

console.log(dbURI, process.env.MONGO_DB)


mongoose.Promise = require('bluebird');

mongoose.connect(dbURI);

// CONNECTION EVENTS
mongoose.connection.on('connected', () => {
  consoleLog('connected to: ', dbURI)
});
mongoose.connection.on('error', (err) => {
  consoleLog(`Mongoose connection error: ${err}`);
});
mongoose.connection.on('disconnected', () => {
  consoleLog('Mongoose disconnected');
});

if (dbBigDataURI && dbBigDataURI !== '') {
    mongoose.big_data_conn = mongoose.createConnection(dbBigDataURI);
    mongoose.big_data_conn.on('connected', () => {
        consoleLog(`Mongoose connected to ${dbBigDataURI}`);
    });
}

// CAPTURE APP TERMINATION / RESTART EVENTS
// To be called when process is restarted or terminated
const gracefulShutdown = (msg, callback) => {
  mongoose.connection.close(() => {
    consoleLog(`Mongoose disconnected through ${msg}`);
    callback();
  });
};
// For nodemon restarts
process.once('SIGUSR2', () => {
  gracefulShutdown('nodemon restart', () => {
    process.kill(process.pid, 'SIGUSR2');
  });
});
// For app termination
process.on('SIGINT', () => {
  gracefulShutdown('app termination', () => {
    process.exit(0);
  });
});
// For Heroku app termination
process.on('SIGTERM', () => {
  gracefulShutdown('Heroku app termination', () => {
    process.exit(0);
  });
});

module.exports = mongoose;*/
