
const sheetService = require('../../../sheets/service/sheetService');
const userSheetService = require('../../../sheets/service/userSheetService');
const sheetRepository = require('../../../sheets/dao/sheetRepository');
const userSheetRepository = require('../../../sheets/dao/userSheetRepository');
const { expect, sinon } = require('../../support/TestUtils');
const dynamodbLocal = require('../core/dynamodbLocal');

describe('userSheetService integration test', () => {

  const sandbox = sinon.sandbox.create();
  let dynamodb, sheetsTableName, usersSheetsTableName;

  before(function() {
    this.timeout(5000);
    sandbox.stub(console, 'info');
    dynamodb = userSheetRepository._dynamodb;
    sheetsTableName = sheetRepository._sheetsTableName;
    usersSheetsTableName = userSheetRepository._usersSheetsTableName;
    let newDynamoDb = dynamodbLocal.start();
    sheetRepository._dynamodb = newDynamoDb;
    userSheetRepository._dynamodb = newDynamoDb;
    sheetRepository._sheetsTableName = 'sheets-test';
    userSheetRepository._usersSheetsTableName = 'usersSheets-test';
    return dynamodbLocal.createTable('usersSheetsTable', 'usersSheets-test').then(() => {
      return dynamodbLocal.createTable('sheetsTable', 'sheets-test');
    }).then(() => {
      return sheetService.save({
        id: 'A',
        tweet: 'tweetValue',
        handles: ['@handleOne', '@handleTwo']
      });
    });
  });

  beforeEach(() => {
    sandbox.restore();
    sandbox.stub(console, 'info');
  });

  after(() => {
    sheetRepository._dynamodb = dynamodb;
    userSheetRepository._dynamodb = dynamodb;
    sheetRepository._sheetsTableName = sheetsTableName;
    userSheetRepository._usersSheetsTableName = usersSheetsTableName;
    dynamodbLocal.stop();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('findOne - no existing userSheet or sheet', () => {
    return expect(userSheetService.findOne('1', 'non-existant'))
      .to.eventually.be.null;
  });

  it('findOne - no existing userSheet but has existing sheet', () => {
    return userSheetService.findOne('1', 'A').then(model => {
      expect(model.userId).to.eql('1');
      expect(model.sheetId).to.eql('A');
      expect(model.sheet.id).to.eql('A');
      expect(model.completions).to.eql([
        { 'handle': '@handleOne', 'completed': false },
        { 'handle': '@handleTwo', 'completed': false }
      ]);
    });
  });

  it('save - new userSheet', () => {
    return userSheetService.save({
      userId: '1',
      sheetId: 'A',
      completions: [{ handle: '@handleOne', completed: true }]
    }).then(() => {
      return userSheetService.findOne('1', 'A');
    }).then(userSheet => {
      expect(userSheet.userId).to.eql('1');
      expect(userSheet.sheetId).to.eql('A');
      expect(userSheet.sheet.id).to.eql('A');
      expect(userSheet.completions).to.eql([
        { handle: '@handleOne', completed: true },
        { handle: '@handleTwo', completed: false }
      ]);
    });
  });

  it('save - existing userSheet', () => {
    return userSheetService.save({
      userId: '1',
      sheetId: 'A',
      completions: [{ handle: '@handleOne', completed: true }]
    }).then(() => {
      return userSheetService.save({
        userId: '1',
        sheetId: 'A',
        completions: [
          { handle: '@handleOne', completed: true },
          { handle: '@handleTwo', completed: true }
        ]
      });
    }).then(() => {
      return userSheetService.findOne('1', 'A');
    }).then(userSheet => {
      expect(userSheet.userId).to.eql('1');
      expect(userSheet.sheetId).to.eql('A');
      expect(userSheet.completions).to.eql([
        { handle: '@handleOne', completed: true },
        { handle: '@handleTwo', completed: true }
      ]);
    });
  });

});
