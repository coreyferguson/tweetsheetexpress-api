
const path = require('path');
const authenticator = require('./authenticator');
const cookieParser = require('../../core/controller/cookieParser');
const twitterService = require('../../twitter/service/twitterService');
const userResourceAssembler = require('./userResourceAssembler');
const userService = require('../service/userService');
const ymlParser = require('../../core/ymlParser');
const config = require('../../config');

class SessionController {

  constructor(options) {
    options = options || {};
    this._authenticator = options.authenticator || authenticator;
    this._cookieParser = options.cookieParser || cookieParser;
    this._twitterService = options.twitterService || twitterService;
    this._userResourceAssembler = options.userResourceAssembler || userResourceAssembler;
    this._userService = options.userService || userService;
    this._cookieProps = ymlParser.parse(path.resolve(__dirname, '../cookies.yml'));
  }

  session(event, response) {
    console.info('SessionController.session(event):', JSON.stringify(event));

    // validate request
    if (!event.queryStringParameters || !event.queryStringParameters.redirectUrl) {
      response.statusCode = 400;
      response.body = { message: 'Missing required `redirectUrl` parameter' };
      return;
    }

    // authenticate
    return authenticator.authenticate(event).then(user => {
      if (user) {
        response.body = {
          authorized: true,
          user: this._userResourceAssembler.toResource(user)
        };
      } else {
        return this._twitterService.fetchRequestToken().then(token => {
          console.info('SessionController.session(), token:', JSON.stringify(token));
          const authorizationUrl =
            this._twitterService.constructAuthorizeUrl(token.oauth_token);
          response.headers = response.headers || {};
          response.headers['set-cookie'] = `${this._cookieProps.tokenLabel}=${token.oauth_token}; Domain=.${config.env.api.domain}; Secure; HttpOnly`;
          response.headers['Set-cookie'] = `${this._cookieProps.tokenSecretLabel}=${token.oauth_token_secret}; Domain=.${config.env.api.domain}; Secure; HttpOnly`;
          response.headers['sEt-cookie'] = `${this._cookieProps.redirectUrlLabel}=${event.queryStringParameters.redirectUrl}; Domain=.${config.env.api.domain}; Secure; HttpOnly`;
          response.body = {
            authorized: false,
            authorizationUrl
          };
        });
      }
    });
  }

  callback(event, response) {
    console.info('SessionController.callback(event):', JSON.stringify(event));
    const cookies = this._cookieParser.cookiesToJson(event);
    const cookieToken = cookies[this._cookieProps.tokenLabel];
    const cookieTokenSecret = cookies[this._cookieProps.tokenSecretLabel];
    const redirectUrl = cookies[this._cookieProps.redirectUrlLabel];
    const twitterToken = event.queryStringParameters.oauth_token;
    const twitterVerifier = event.queryStringParameters.oauth_verifier;

    // verify request token from `/session` is the same as what twitter gave us
    if (cookieToken !== twitterToken) {
      response.statusCode = 401;
      response.body = { message: 'Missing authentication credentials.' };
      return;
    }

    // user is who they say they are, save credentials to cookies and database
    return this._twitterService
      .fetchAccessToken(twitterToken, cookieTokenSecret, twitterVerifier)
      .then(res => {
        console.info('SessionController.callback(), fetchAccessToken res:', JSON.stringify(res));
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
          response.statusCode = 302;
          response.headers = response.headers || {};
          response.headers['set-cookie'] = `${this._cookieProps.userIdLabel}=${res.user_id}; Domain=.${config.env.api.domain}; Secure`;
          response.headers['Set-cookie'] = `${this._cookieProps.tokenLabel}=${res.oauth_token}; Domain=.${config.env.api.domain}; Secure; HttpOnly`;
          response.headers['sEt-cookie'] = `${this._cookieProps.tokenSecretLabel}=${res.oauth_token_secret}; Domain=.${config.env.api.domain}; Secure; HttpOnly`;
          response.headers['location'] = redirectUrl;
        });
      });
  }

}

// export singleton
const singleton = new SessionController();
singleton.SessionController = SessionController;
module.exports = singleton;
