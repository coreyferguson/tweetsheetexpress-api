
const slscrypt = require('slscrypt');
const sessionController = require('./sessionController');
const config = require('../../config');

module.exports.session = (event, context, callback) => {
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
      return;
    }
  }

  return sessionController.session(event).then(response => {
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
    console.log('err:', err, err.stack);
    callback(
      err,
      Object.assign(
        {
          statusCode: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
          },
          body: JSON.stringify({
            message: 'Sorry, something bad happened.'
          })
        }
      )
    );
  });

  // return Promise.all([
  //   slscrypt.get('twitterConsumerKey'),
  //   slscrypt.get('twitterConsumerSecret')
  // ]).then(twitterConsumerCredentials => {
  //   console.log('twitterConsumerCredentials:', twitterConsumerCredentials);
  //   return sessionController.session(event, context);
  // });
};

module.exports.callback = (event, context, callback) => {
  return sessionController.callback(event).then(response => {
    callback(
      null,
      Object.assign(
        {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
          }
        },
        response
      )
    );
  }).catch(err => {
    console.log('err:', JSON.stringify(err));
    console.log('err stack:', err.stack);
    callback(
      null,
      Object.assign(
        {
          statusCode: err.statusCode || 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
          },
          body: JSON.stringify({
            message: err.message || 'Sorry, something bad happened.',
            error: err.error
          })
        }
      )
    );
  });
  // callback(null, {
  //   statusCode: 200,
  //   headers: {
  //     'Access-Control-Allow-Origin': '*',
  //     'Access-Control-Allow-Credentials': true
  //   },
  //   body: JSON.stringify({ event })
  // });
};
