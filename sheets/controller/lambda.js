
const controller = require('./sheetsController');
const filterChain = require('../../core/controller/filterChain');

module.exports.findOne = (event, context, callback) => {
  const fn = controller.findOne.bind(controller);
  return filterChain.wrapInChain(event, fn).then(response => {
    response.body = JSON.stringify(response.body);
    callback(null, response);
  }).catch(error => {
    if (error) console.info('error:', JSON.stringify(error));
    if (error && error.stack)
      console.info('error stack:', JSON.stringify(error.stack));
    callback(error, error.response);
  });
};

module.exports.tweet = (event, context, callback) => {
  const fn = controller.tweet.bind(controller);
  return filterChain.wrapInChain(event, fn).then(response => {
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
