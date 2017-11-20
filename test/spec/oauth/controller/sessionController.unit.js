
const SessionController = require('../../../../oauth/controller/sessionController').SessionController;
const { expect, sinon } = require('../../../support/TestUtils');
const ymlParser = require('../../../../core/ymlParser');
const path = require('path');

const cookieProps = ymlParser.parse(
  path.resolve(__dirname, '../../../../oauth/cookies.yml'));

const mockData = {
  'callback-request-success': require('./mock-data/callback-request-success.json'),
  'callback-request-no-cookies': require('./mock-data/callback-request-no-cookies.json'),
  'session-ftu-success': require('./mock-data/session-ftu-success.json')
};

describe('sessionController unit tests', () => {

  const sandbox = sinon.sandbox.create();
  const controller = new SessionController();

  beforeEach(() => {
    sandbox.stub(console, 'info');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('session - successful first time use (ftu)', () => {
    // no user exists yet so authenticate returns null
    sandbox
      .stub(controller._authenticator, 'authenticate')
      .returns(Promise.resolve(null));
    sandbox
      .stub(controller._twitterService, 'fetchRequestToken')
      .returns(Promise.resolve({
        oauth_token: 'El7ndAAAAAAA1XxsAAABXR1UXZ8',
        oauth_token_secret: 'de9mHW5jtZ8VL0FwloxuqgElPZgoXUcJ',
        oauth_callback_confirmed: 'true'
      }));
    sandbox
      .stub(controller._twitterService, 'constructAuthorizeUrl')
      .returns('https://api.twitter.com/oauth/authorize?oauth_token=El7ndAAAAAAA1XxsAAABXR1UXZ8');
    const response = {};
    return controller.session(mockData['session-ftu-success'], response).then(() => {
      const body = response.body;
      const headers = response.headers;
      expect(body.authorizationUrl)
        .to.startWith('https://api.twitter.com/oauth/authorize?oauth_token');
      expect(headers).to.have.property(
        'set-cookie',
        `${cookieProps.tokenLabel}=El7ndAAAAAAA1XxsAAABXR1UXZ8; Domain=.tweetsheets-api-test.overattribution.com; Secure; HttpOnly`);
      expect(headers).to.have.property(
        'Set-cookie',
        `${cookieProps.tokenSecretLabel}=de9mHW5jtZ8VL0FwloxuqgElPZgoXUcJ; Domain=.tweetsheets-api-test.overattribution.com; Secure; HttpOnly`);
    });
  });

  it('session - successful second time use', () => {
    sandbox
      .stub(controller._authenticator, 'authenticate')
      .returns(Promise.resolve({
        oauth_token: '881936187492941825-cyrgkZfPmDF6wU8GNkWShb4KEJlMyeb',
        oauth_token_secret: '5rJlIxUiUpq1K4Sb8kZorWlY2R55EvtRLySxn7IuJ8lgj',
        user_id: '881936187492941825',
        screen_name: 'tweetsheetstest'
      }));
    const response = {};
    return controller.session(mockData['session-ftu-success'], response).then(() => {
      expect(response.body.authorized).to.be.true;
    });
  });

  it('callback - convert to access token and save to db', () => {
    const cookies = {};
    cookies[cookieProps.tokenLabel] = 'C6_urwAAAAAA1XxsAAABXR1ESuQ';
    sandbox.stub(controller._cookieParser, 'cookiesToJson').returns(cookies);
    sandbox.stub(controller._twitterService, 'fetchAccessToken')
      .returns(Promise.resolve({
        oauth_token: '881936187492941825-cyrgkZfPmDF6wU8GNkWShb4KEJlMyeb',
        oauth_token_secret: '5rJlIxUiUpq1K4Sb8kZorWlY2R55EvtRLySxn7IuJ8lgj',
        user_id: '881936187492941825',
        screen_name: 'tweetsheetstest',
        x_auth_expires: '0'
      }));
    sandbox.stub(controller._userService, 'findOne')
      .returns(Promise.resolve(null));
    sandbox.stub(controller._userService, 'save');
    const response = {};
    return controller.callback(mockData['callback-request-success'], response).then(() => {
      expect(response.headers).to.have.property(
        'set-cookie',
        `${cookieProps.userIdLabel}=881936187492941825; Domain=.tweetsheets-api-test.overattribution.com; Secure`);
      expect(response.headers).to.have.property(
        'Set-cookie',
        `${cookieProps.tokenLabel}=881936187492941825-cyrgkZfPmDF6wU8GNkWShb4KEJlMyeb; Domain=.tweetsheets-api-test.overattribution.com; Secure; HttpOnly`);
      expect(response.headers).to.have.property(
        'sEt-cookie',
        `${cookieProps.tokenSecretLabel}=5rJlIxUiUpq1K4Sb8kZorWlY2R55EvtRLySxn7IuJ8lgj; Domain=.tweetsheets-api-test.overattribution.com; Secure; HttpOnly`);
    });
  });

  it('session - redirectUrl not given');
  it('session - timed out');

});
