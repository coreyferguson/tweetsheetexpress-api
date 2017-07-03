
const userService = require('../service/userService');
const ymlParser = require('../../core/ymlParser');
const path = require('path');

class Authenticator {

  constructor(options) {
    options = options || {};
    const cookies = ymlParser.parse(path.resolve(__dirname, '../cookies.yml'));
    this._options = Object.assign({
      userIdLabel: cookies.userIdLabel,
      tokenSecretLabel: cookies.tokenSecretLabel
    }, options);
    this._userService = options.userService || userService;
  }

  getUserId(event) {
    if (!event || !event.headers || !event.headers.Cookie) {
      return null;
    } else {
      const regex = new RegExp(`${this._options.userIdLabel}=(\\d+)`);
      const found = event.headers.Cookie.match(regex);
      if (!found || !found[1]) return null;
      else return found[1];
    }
  }

  getTokenSecret(event) {
    if (!event || !event.headers || !event.headers.Cookie) {
      return null;
    } else {
      const regex = new RegExp(`${this._options.tokenSecretLabel}=(\\w+)`);
      const found = event.headers.Cookie.match(regex);
      if (!found || !found[1]) return null;
      else return found[1];
    }
  }

  authenticate(event) {
    const userId = this.getUserId(event);
    const tokenSecret = this.getTokenSecret(event);
    if (!userId) return Promise.resolve(null);
    else {
      return this._userService.findOne(userId).then(user => {
        // TODO: Validate user.tokenSecret has not expired
        return (tokenSecret !== user.tokenSecret) ? null : user;
      });
    }
  }

}

// export singleton
const singleton = new Authenticator();
singleton.Authenticator = Authenticator;
module.exports = singleton;
