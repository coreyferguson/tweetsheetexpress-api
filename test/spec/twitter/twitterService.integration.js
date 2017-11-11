
const bluebird = require('bluebird');
const request = require('request-promise');
const uuid = require('uuid/v4');
const client = require('../oauth/client');
const server = require('../oauth/server');
const TwitterService = require('../../../twitter/service/twitterService').TwitterService;
const { expect } = require('../../support/TestUtils');
const config = require('../../../config');

/**
 * Tests end-to-end authorization with Twitter's 3-legged authorization.
 *
 * ORDER IS IMPORTANT WITHIN THIS SUITE
 *
 * @see https://dev.twitter.com/oauth/3-legged
 */
describe('twitterService - 3 Legged Authorization', function() {

  let twitterService;
  let requestToken, authorization, credentials;

  before(() => {
    twitterService = new TwitterService({
      callback: `http://localhost:${config.test.express.port}/callback`
    });
    return server.start();
  });

  after(() => {
    return server.stop();
  });

  it('fetch request token', () => {
    return twitterService.fetchRequestToken().then(res => {
      requestToken = res;
      expect(requestToken).to.have.property('oauth_token');
      expect(requestToken).to.have.property('oauth_token_secret');
      expect(requestToken).to.have.property('oauth_callback_confirmed');
      expect(requestToken.oauth_callback_confirmed).to.equal('true');
    });
  });

  it('client authorization', function() {
    this.timeout(60000);
    const redirectUrl = twitterService.constructAuthorizeUrl(requestToken.oauth_token);
    return Promise.all([
      server.waitForCallback().then(res => {
        authorization = res;
        expect(authorization).to.have.property('oauth_token');
        expect(authorization).to.have.property('oauth_verifier');
      }),
      client.authorize(redirectUrl)
    ]);
  });

  it('request token -> access token', () => {
    return twitterService.fetchAccessToken(
      authorization.oauth_token,
      requestToken.oauth_token_secret,
      authorization.oauth_verifier
    ).then(credentials => {
      expect(credentials).to.have.property('user_id', '881936187492941825');
      expect(credentials).to.have.property('screen_name', 'tweetsheetstest');
    });
  });

  it('user details', function() {
    this.timeout(5000);
    return twitterService.fetchUser(
      credentials.oauth_token,
      credentials.oauth_token_secret,
      credentials.screen_name
    ).then(user => {
      expect(user).to.have.property('id', 881936187492941800);
      expect(user).to.have.property('name', 'Tweetsheets Test');
      expect(user).to.have.property('screen_name', 'tweetsheetstest');
    });
  });

  it('post on users behalf', function() {
    this.timeout(5000);
    const message = uuid();
    return twitterService.tweet(
      credentials.oauth_token,
      credentials.oauth_token_secret,
      message
    ).then(response => {
      const id = response.id_str;
      return twitterService.destroy(
        credentials.oauth_token,
        credentials.oauth_token_secret,
        id
      ).catch(err => {
        console.log('err:', JSON.stringify(err));
        throw err;
      });
    });
  });

  it('delete all my tweets', function() {
    this.timeout(10000);
    return twitterService.fetchTweets(
      credentials.oauth_token,
      credentials.oauth_token_secret,
      credentials.screen_name
    ).then(response => {
      const tweets = JSON.parse(response);
      const tweetIds = tweets.map(tweet => tweet.id_str);
      return bluebird.map(tweetIds, tweetId => {
        return twitterService.destroy(
          credentials.oauth_token,
          credentials.oauth_token_secret,
          tweetId);
      });
    });
  });

});
