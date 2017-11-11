
const config = require('../../config/config');

class CorsFilter {

  apply(event, response) {
    let allowOrigin = undefined;
    if (event && event.headers && event.headers.origin) {
      config.env.api.allowOrigins.forEach(origin => {
        if (origin == event.headers.origin) allowOrigin = origin;
      });
    }
    response.headers = response.headers || {};
    response.headers['Access-Control-Allow-Origin'] = allowOrigin
      || config.env.api.allowOrigins[0];
    response.headers['Access-Control-Allow-Credentials'] = true;
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type';
    if (!allowOrigin) {
      response.statusCode = 401;
      return Promise.resolve(false);
    } else {
      return Promise.resolve(true);
    }
  }

}

module.exports = new CorsFilter();
