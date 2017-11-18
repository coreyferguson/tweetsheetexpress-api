
const request = require('request-promise');
const qs = require('qs'); // querystring

class TwitterService {

  constructor(options) {
    this._options = Object.assign({
      consumerKey: 'sl8CM6gpQoKx26Na0Utfmt8za',
      consumerSecret: 'xKXnjl7plwKOWRaocWwqQKhkaxBt9nA1LgLr7DdPEwhn4ZJKjx',
      callback: 'https://tweetsheets-api-dev.overattribution.com/callback'
    }, options);
    this._request = request;
  }

  /**
   * First step in Twitter's 3-legged authorization mechanism.
   * https://developer.twitter.com/en/docs/basics/authentication/overview/3-legged-oauth
   */
  fetchRequestToken() {
    return request.post({
      url: 'https://api.twitter.com/oauth/request_token',
      oauth: {
        callback: this._options.callback,
        consumer_key: this._options.consumerKey,
        consumer_secret: this._options.consumerSecret
      }
    }).then(qs.parse);
  }

  /**
   * Second step in Twitter's 3-legged authorization mechanism.
   * https://developer.twitter.com/en/docs/basics/authentication/overview/3-legged-oauth
   */
  constructAuthorizeUrl(token) {
    return 'https://api.twitter.com/oauth/authorize' +
      '?' +
      qs.stringify({
        oauth_token: token
      });
  }

  /**
   * Third step in Twitter's 3-legged authorization mechanism.
   * https://developer.twitter.com/en/docs/basics/authentication/overview/3-legged-oauth
   */
  fetchAccessToken(token, token_secret, verifier) {
    return request.post({
      url: 'https://api.twitter.com/oauth/access_token',
      oauth: {
        consumer_key: this._options.consumerKey,
        consumer_secret: this._options.consumerSecret,
        token,
        token_secret,
        verifier
      }
    }).then(qs.parse);
  }

  fetchUser(token, token_secret, screen_name) {
    return request.get({
      url: 'https://api.twitter.com/1.1/users/show.json',
      oauth: {
        consumer_key: this._options.consumerKey,
        consumer_secret: this._options.consumerSecret,
        token,
        token_secret
      },
      qs: {
        screen_name
      }
    }).then(JSON.parse);
  }

  fetchTweets(token, token_secret, screen_name) {
    return request.get({
      url: 'https://api.twitter.com/1.1/statuses/user_timeline.json',
      oauth: {
        consumer_key: this._options.consumerKey,
        consumer_secret: this._options.consumerSecret,
        token,
        token_secret
      },
      qs: {
        screen_name
      }
    });
  }

  tweet(token, token_secret, message) {
    return request.post({
      url: 'https://api.twitter.com/1.1/statuses/update.json',
      oauth: {
        consumer_key: this._options.consumerKey,
        consumer_secret: this._options.consumerSecret,
        token,
        token_secret
      },
      qs: {
        status: message
      }
    }).then(JSON.parse);
  }

  destroy(token, token_secret, id) {
    return request.post({
      url: `https://api.twitter.com/1.1/statuses/destroy/${id}.json`,
      oauth: {
        consumer_key: this._options.consumerKey,
        consumer_secret: this._options.consumerSecret,
        token,
        token_secret
      }
    }).then(JSON.parse);
  }

}

// export singleton
const singleton = new TwitterService();
singleton.TwitterService = TwitterService;
module.exports = singleton;
