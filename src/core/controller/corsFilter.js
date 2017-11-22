
const config = require('../../config/config');

class CorsFilter {

  process(event, response) {
    console.info('CorsFilter.process');
    return new Promise(resolve => {
      let origin = this.getOrigin(event);
      let allowedOrigin = this.getAllowedOrigin(origin);
      response.headers = response.headers || {};
      response.headers['Access-Control-Allow-Origin'] = allowedOrigin
        || config.env.api.allowOrigins[0];
      response.headers['Access-Control-Allow-Credentials'] = true;
      response.headers['Access-Control-Allow-Headers'] = 'Content-Type';
      resolve(true);
    });
  }

  getOrigin(event) {
    let origin;
    if (event && event.headers) {
      if (event.headers.origin) {
        console.info('CorsFilter.getOrigin, event.headers.origin:', event.headers.origin);
        origin = event.headers.origin;
      } else if (event.headers.Origin) {
        console.info('CorsFilter.getOrigin, event.headers.Origin:', event.headers.Origin);
        origin = event.headers.Origin;
      }
    }
    return origin;
  }

  getAllowedOrigin(origin) {
    let allowedOrigin = config.env.api.allowOrigins[0];
    if (!origin) return allowedOrigin;
    config.env.api.allowOrigins.forEach(o => {
      if (o == origin) allowedOrigin = o;
    });
    return allowedOrigin;
  }

}

module.exports = new CorsFilter();
