
const controller = require('./sessionController');
const filterChain = require('../../core/controller/filterChain');

module.exports.session = (event, context, callback) => {
  console.info('oauth/controller/lambda.session(event):', JSON.stringify(event));
  const fn = controller.session.bind(controller);
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

module.exports.callback = (event, context, callback) => {
  console.info('oauth/controller/lambda.callback(event):', JSON.stringify(event));
  const fn = controller.callback.bind(controller);
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

module.exports.signOut = (event, context, callback) => {
  console.info('oauth/controller/lambda.signOut(event):', JSON.stringify(event));
  const fn = controller.signOut.bind(controller);
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
