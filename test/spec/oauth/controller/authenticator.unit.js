
const authenticator = require('../../../../src/oauth/controller/authenticator');
const { expect, sinon } = require('../../../support/TestUtils');

describe('authenticator unit tests', () => {

  let sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('extract `twitterUserId` and `twitterTokenSecret` from cookies', () => {
    const event = {
      httpMethod: 'GET',
      path: '/session',
      headers: {
        Cookie: 'twitterUserId=881936187492941825; ' +
          'twitterTokenSecret=5rJlIxUiUpq1K4Sb8kZorWlY2R55EvtRLySxn7IuJ8lgj'
      }
    };
    const userId = authenticator.getUserId(event);
    const tokenSecret = authenticator.getTokenSecret(event);
    expect(userId).to.equal('881936187492941825');
    expect(tokenSecret).to.equal('5rJlIxUiUpq1K4Sb8kZorWlY2R55EvtRLySxn7IuJ8lgj');
  });

  it('extract null `twitterUserId` and `twitterTokenSecret` from cookies', () => {
    const event = {
      httpMethod: 'GET',
      path: '/session',
      headers: {
        Cookie: 'cookieLabel=cookieValue'
      }
    };
    const userId = authenticator.getUserId(event);
    const tokenSecret = authenticator.getTokenSecret(event);
    expect(userId).to.be.null;
    expect(tokenSecret).to.be.null;
  });

  it('authenticate successfully', () => {
    const event = {
      httpMethod: 'GET',
      path: '/session',
      headers: {
        Cookie: 'twitterUserId=881936187492941825; twitterToken=tokenValue; twitterTokenSecret=tokenSecretValue'
      }
    };
    const model = {
      id: '881936187492941825',
      token: 'tokenValue',
      tokenSecret: 'tokenSecretValue'
    };
    sandbox.stub(authenticator._userService, 'findOne')
      .returns(Promise.resolve(model));
    return authenticator.authenticate(event).then(user => {
      expect(user).to.not.be.null;
    });
  });

  it('authenticate unsuccesfully', () => {
    const event = {
      httpMethod: 'GET',
      path: '/session',
      headers: {
        Cookie: 'twitterUserId=881936187492941825; twitterTokenSecret=tokenSecretValue'
      }
    };
    const model = {
      id: '881936187492941825',
      tokenSecret: 'notTokenSecretValue'
    };
    sandbox.stub(authenticator._userService, 'findOne')
      .returns(Promise.resolve(model));
    return authenticator.authenticate(event).then(user => {
      expect(user).to.be.null;
    });
  });

  describe('getToken', () => {

    it('881936187492941825', () => {
      expect(
        authenticator.getToken({
          headers: {
            Cookie: 'tweetsheetsRedirectUrl=tweetsheetsRedirectUrlValue; '
             + 'twitterToken=881936187492941825; '
             + 'twitterTokenSecret=tokenSecretValue'
          }
        })
      ).to.equal('881936187492941825');
    });

    it('881936187492941825-HcGGODHgN4bAfHDURwi0IDHxw0bcELS', () => {
      expect(
        authenticator.getToken({
          headers: {
            Cookie: 'tweetsheetsRedirectUrl=tweetsheetsRedirectUrlValue; '
             + 'twitterToken=881936187492941825-HcGGODHgN4bAfHDURwi0IDHxw0bcELS; '
             + 'twitterTokenSecret=tokenSecretValue'
          }
        })
      ).to.equal('881936187492941825-HcGGODHgN4bAfHDURwi0IDHxw0bcELS');
    });

  });

});
