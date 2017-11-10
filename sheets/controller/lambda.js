
const config = require('../../config');
const controller = require('./sheetsController');
const filterChain = require('../../core/controller/filterChain');

module.exports.tweet = (event, context, callback) => {
  return filterChain.wrapInChain(event, controller.tweet).then(response => {
    response.body = JSON.stringify(response.body);
    callback(null, response);
  }).catch(error => {
    if (error) console.log('error:', JSON.stringify(error));
    if (error && error.stack)
      console.log('error stack:', JSON.stringify(error.stack));
    callback(error, error.response);
  });
};

module.exports.tweetPreflight = (event, context, callback) => {
  return filterChain.wrapInChain(event).then(response => {
    callback(null, response);
  }).catch(error => {
    if (error) console.log('error:', JSON.stringify(error));
    if (error && error.stack)
      console.log('error stack:', JSON.stringify(error.stack));
    callback(error, error.response);
  });
};
