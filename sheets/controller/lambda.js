
const config = require('../../config');
const controller = require('./sheetsController');
const filterChain = require('../../core/controller/filterChain');

module.exports.tweet = (event, context, callback) => {
  return filterChain.wrapInChain(event, controller.tweet.bind(controller)).then(response => {
    response.body = JSON.stringify(response.body);
    callback(null, response);
  }).catch(error => {
    if (error) console.info('error:', JSON.stringify(error));
    if (error && error.stack)
      console.info('error stack:', JSON.stringify(error.stack));
    callback(error, error.response);
  });
};

module.exports.tweetPreflight = (event, context, callback) => {
  return filterChain.wrapInChain(event).then(response => {
    callback(null, response);
  }).catch(error => {
    if (error) console.info('error:', JSON.stringify(error));
    if (error && error.stack)
      console.info('error stack:', JSON.stringify(error.stack));
    callback(error, error.response);
  });
};
