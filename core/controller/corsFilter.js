
const config = require('../../config/config');

class CorsFilter {

  apply(event, response) {
    let allowOrigin = config.env.api.allowOrigins[0];
    if (event && event.headers && event.headers.origin) {
      config.env.api.allowOrigins.forEach(origin => {
        if (origin == event.headers.origin) allowOrigin = origin;
      });
    }
    response.headers = response.headers || {};
    response.headers['Access-Control-Allow-Origin'] = allowOrigin;
    response.headers['Access-Control-Allow-Credentials'] = true;
    return Promise.resolve(true);
  }

}

module.exports = new CorsFilter();
