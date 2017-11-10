
const path = require('path');
const authenticator = require('./authenticator');
const cookieParser = require('../../core/controller/cookieParser');
const twitterService = require('../../twitter/service/twitterService');
const userService = require('../service/userService');
const ymlParser = require('../../core/ymlParser');
const config = require('../../config');

class SessionController {

  constructor(options) {
    options = options || {};
    this._authenticator = options.authenticator || authenticator;
    this._cookieParser = options.cookieParser || cookieParser
    this._twitterService = options.twitterService || twitterService
    this._userService = options.userService || userService
    this._cookieProps = ymlParser.parse(path.resolve(__dirname, '../cookies.yml'));
  }

  session(event) {
    // validate request
    if (!event.queryStringParameters || !event.queryStringParameters.redirectUrl) {
      return Promise.resolve({
        statusCode: 400,
        body: JSON.stringify({
          message: 'Missing required `redirectUrl` parameter'
        })
      });
    }

    // allow origin
    let allowOrigin;
    if (event && event.headers && event.headers.origin) {
      config.env.api.allowOrigins.forEach(origin => {
        if (origin == event.headers.origin) allowOrigin = origin;
      });
      if (allowOrigin == null) {
        return Promise.resolve({
          statusCode: 401,
          headers: {
            'Access-Control-Allow-Origin': config.env.api.allowOrigins[0],
            'Access-Control-Allow-Credentials': true
          }
        });
      }
    }

    // authenticate
    return authenticator.authenticate(event).then(user => {
      if (!user) {
        return twitterService.fetchRequestToken().then(token => {
          const authorizationUrl =
            twitterService.constructAuthorizeUrl(token.oauth_token);
          return {
            body: JSON.stringify({
              authorized: false,
              authorizationUrl,
              event
            }),
            headers: {
              'Access-Control-Allow-Origin': allowOrigin,
              'Access-Control-Allow-Credentials': true,
              'set-cookie': `${this._cookieProps.tokenLabel}=${token.oauth_token}; Domain=.${config.env.api.domain}; Secure; HttpOnly`,
              'Set-cookie': `${this._cookieProps.tokenSecretLabel}=${token.oauth_token_secret}; Domain=.${config.env.api.domain}; Secure; HttpOnly`,
              'sEt-cookie': `${this._cookieProps.redirectUrlLabel}=${event.queryStringParameters.redirectUrl}; Domain=.${config.env.api.domain}; Secure; HttpOnly`
            }
          };
        });
      } else {
        return {
          body: JSON.stringify({
            authorized: true,
            userId: user.id
          })
        };
      }
    });
  }

  callback(event) {
    const cookies = this._cookieParser.cookiesToJson(event);
    const cookieToken = cookies[this._cookieProps.tokenLabel];
    const cookieTokenSecret = cookies[this._cookieProps.tokenSecretLabel];
    const redirectUrl = cookies[this._cookieProps.redirectUrlLabel];
    const twitterToken = event.queryStringParameters.oauth_token;
    const twitterVerifier = event.queryStringParameters.oauth_verifier;

    // verify request token from `/session` is the same as what twitter gave us
    if (cookieToken !== twitterToken) {
      return Promise.resolve({
        statusCode: 401,
        body: JSON.stringify({
          message: 'Missing authentication credentials.'
        })
      });
    }

    // user is who they say they are, save credentials to cookies and database
    return this._twitterService
      .fetchAccessToken(twitterToken, cookieTokenSecret, twitterVerifier)
      .then(res => {
        // save user to db
        return this._userService.findOne(res.user_id).then(user => {
          user = user || {};
          user.id = res.user_id;
          user.screenName = res.screen_name;
          user.token = res.oauth_token;
          user.tokenSecret = res.oauth_token_secret;
          return this._userService.save(user);
        }).then(() => {
          // set auth cookies and redirect user to original location
          return {
            statusCode: 302,
            headers: {
              'location': redirectUrl,
              'set-cookie': `${this._cookieProps.userIdLabel}=${res.user_id}; Domain=.${config.env.api.domain}; Secure`,
              'sEt-cookie': `${this._cookieProps.tokenLabel}=${res.oauth_token}; Domain=.${config.env.api.domain}; Secure; HttpOnly`,
              'Set-cookie': `${this._cookieProps.tokenSecretLabel}=${res.oauth_token_secret}; Domain=.${config.env.api.domain}; Secure; HttpOnly`
            }
          };
        });
      });
  }

}

// export singleton
const singleton = new SessionController();
singleton.SessionController = SessionController;
module.exports = singleton;
