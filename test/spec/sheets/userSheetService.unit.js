const path = require('path');
const { expect, sinon } = require('../../support/TestUtils');
const userSheetService = require('../../../sheets/service/userSheetService');
const ymlParser = require('../../../core/ymlParser');

// mock data
const ymlToJson = fileName =>
  ymlParser.parse(path.join(__dirname, `mockData/${fileName}.yml`));
const mockData = JSON.stringify({
  duplicateStatus: ymlToJson('duplicateStatus'),
  overDailyLimit: ymlToJson('overDailyLimit'),
  user: ymlToJson('user'),
  userSheet: ymlToJson('userSheet')
});
const mock = key => JSON.parse(mockData)[key];

describe('userSheetService unit tests', () => {

  const sandbox = sinon.sandbox.create();

  beforeEach(() => {
    sandbox.stub(console, 'info');
  })

  afterEach(() => {
    sandbox.restore();
  });

  it('tweet sheet', () => {
    const userSheet = mock('userSheet');
    sandbox.stub(userSheetService, 'findOne')
      .returns(Promise.resolve(userSheet));
    const stub = sandbox
      .stub(userSheetService._twitterService, 'tweet')
      .resolves();
    sandbox.stub(userSheetService._userService, 'findOne')
      .resolves(mock('user'))
    sandbox.stub(userSheetService, 'save').resolves();
    sandbox.stub(userSheetService, '_isUserThrottled').resolves(false);
    sandbox.stub(userSheetService, '_throttleUser').resolves();
    return userSheetService.tweet(
      'userIdValue',
      'sheetIdValue',
      'tokenValue',
      'tokenSecretValue'
    ).then(userSheet => {
      expect(stub).to.be.calledWith(
        'tokenValue', 'tokenSecretValue', 'Hello @handleTwo, how are you?');
      expect(stub).to.be.calledWith(
        'tokenValue', 'tokenSecretValue', 'Hello @handleThree, how are you?');
      expect(stub).to.be.calledWith(
        'tokenValue', 'tokenSecretValue', 'Hello @handleFour, how are you?');
      expect(stub).to.be.calledWith(
        'tokenValue', 'tokenSecretValue', 'Hello @handleFive, how are you?');
      expect(userSheet.completions).to.eql([
        { handle: '@handleOne', completed: true },
        { handle: '@handleTwo', completed: true },
        { handle: '@handleThree', completed: true },
        { handle: '@handleFour', completed: true },
        { handle: '@handleFive', completed: true }
      ]);
    });
  });

  it('tweet sheet with duplicates', () => {
    sandbox.stub(userSheetService, 'findOne').resolves(mock('userSheet'));
    const stub = sandbox.stub(userSheetService._twitterService, 'tweet');
    sandbox.stub(userSheetService._userService, 'findOne')
      .resolves(mock('user'))
    stub.resolves();
    stub.onCall(1).rejects(mock('duplicateStatus'));
    sandbox.stub(userSheetService, 'save').resolves();
    sandbox.stub(userSheetService, '_isUserThrottled').resolves(false);
    sandbox.stub(userSheetService, '_throttleUser').resolves();
    return userSheetService.tweet(
      'userIdValue',
      'sheetIdValue',
      'tokenValue',
      'tokenSecretValue'
    ).then(userSheet => {
      expect(userSheet.completions).to.eql([
        { handle: '@handleOne', completed: true },
        { handle: '@handleTwo', completed: true },
        { handle: '@handleThree', completed: true },
        { handle: '@handleFour', completed: true },
        { handle: '@handleFive', completed: true }
      ]);
    });
  });

  it('tweet sheet but over Twitters daily limit', () => {
    sandbox.stub(userSheetService, 'findOne')
      .returns(Promise.resolve(mock('userSheet')));
    const stub = sandbox.stub(userSheetService._twitterService, 'tweet');
    sandbox.stub(userSheetService._userService, 'findOne')
      .resolves(mock('user'))
    stub.resolves();
    stub.onCall(1).rejects(mock('overDailyLimit'));
    sandbox.stub(userSheetService, 'save').resolves();
    sandbox.stub(userSheetService, '_isUserThrottled').resolves(false);
    sandbox.stub(userSheetService, '_throttleUser').resolves();
    return expect(userSheetService.tweet(
      'userIdValue',
      'sheetIdValue',
      'tokenValue',
      'tokenSecretValue'
    )).to.eventually.be.rejectedWith(/daily status update limit/);
  });

  it('throttle has not yet been lifted', () => {
    const user = mock('user');
    const oneSecondFromNow = new Date(new Date().getTime() + 1000);
    user.nextTweetsheetBatch = oneSecondFromNow.toISOString();
    return expect(userSheetService._isUserThrottled(user))
      .to.eventually.equal(true);
  });

  it('throttle has been lifted', () => {
    const user = mock('user');
    const oneSecondAgo = new Date(new Date().getTime() - 1000);
    user.nextTweetsheetBatch = oneSecondAgo.toISOString();
    return expect(userSheetService._isUserThrottled(user))
      .to.eventually.equal(false);
  });

});
