
const controller = require('./sheetsController');
const config = require('../../config');
const filterChain = require('../../core/controller/filterChain');

module.exports.tweet = (event, context, callback) => {
  return filterChain.wrapInChain(event, controller.tweet).then(response => {
    response.body = JSON.stringify(response.body);
    callback(null, response);
  }).catch(error => {
    if (error) console.log('error:', JSON.stringify(error));
    if (error && error.stack)
      console.log('error stack:', JSON.stringify(error.stack));
    callback()
  });

  return controller.tweet(event).then(response => {
    callback(
      null,
      Object.assign(
        {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': allowOrigin,
            'Access-Control-Allow-Credentials': true
          }
        },
        response
      )
    );
  }).catch(err => {
    if (err) console.log('err:', JSON.stringify(err));
    if (err && err.stack) console.log('err stack:', JSON.stringify(err.stack));
    callback(
      err,
      Object.assign(
        {
          statusCode: 500,
          headers: {
            'Access-Control-Allow-Origin': allowOrigin,
            'Access-Control-Allow-Credentials': true
          },
          body: JSON.stringify({
            message: 'Sorry, something bad happened.'
          })
        }
      )
    );
  });
};

module.exports.tweetPreflight = (event, context, callback) => {
  // allow origin
  let allowOrigin;
  if (event && event.headers && event.headers.origin) {
    config.env.api.allowOrigins.forEach(origin => {
      if (origin == event.headers.origin) allowOrigin = origin;
    });
    if (allowOrigin == null) {
      callback(null, {
        statusCode: 401,
        headers: {
          'Access-Control-Allow-Origin': config.env.api.allowOrigins[0],
          'Access-Control-Allow-Credentials': true
        }
      });
    } else {
      callback(null, {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': allowOrigin,
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Credentials': true
        }
      });
    }
  }
};
