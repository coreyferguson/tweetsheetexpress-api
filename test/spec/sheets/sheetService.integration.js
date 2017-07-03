
const service = require('../../../sheets/service/sheetService');
const repository = require('../../../sheets/dao/sheetRepository');
const { expect, sinon } = require('../../support/TestUtils');
const dynamodbLocal = require('../core/dynamodbLocal');

describe('sheetService integration test', () => {

  let sandbox = sinon.sandbox.create();
  let dynamodb, sheetsTableName;

  before(function() {
    this.timeout(5000);
    dynamodb = repository._dynamodb;
    sheetsTableName = repository._sheetsTableName;
    let newDynamoDb = dynamodbLocal.start();
    repository._dynamodb = newDynamoDb;
    repository._sheetsTableName = 'sheets-test';
    return dynamodbLocal.createTable('sheetsTable', 'sheets-test');
  });

  after(() => {
    repository._dynamodb = dynamodb;
    repository._sheetsTableName = sheetsTableName;
    dynamodbLocal.stop();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('findOne - no existing sheet', () => {
    return expect(service.findOne('1')).to.eventually.be.null;
  });

  it('save - new sheet', () => {
    return service.save({
      id: '1',
      tweet: 'tweetValue',
      handles: [
        '@handleOne',
        '@handleTwo'
      ]
    }).then(() => {
      return service.findOne('1');
    }).then(sheet => {
      expect(sheet.id).to.eql('1');
      expect(sheet.tweet).to.eql('tweetValue');
      expect(sheet.handles).to.eql([
        '@handleOne',
        '@handleTwo'
      ]);
    });
  });

  it('save - existing sheet', () => {
    return service.save({
      id: '2',
      tweet: 'oldTweetValue',
      handles: [
        '@handleOne'
      ]
    }).then(() => {
      return service.save({
        id: '2',
        tweet: 'newTweetValue',
        handles: [
          '@handleOne',
          '@handleTwo'
        ]
      });
    }).then(() => {
      return service.findOne('2');
    }).then(sheet => {
      expect(sheet.id).to.eql('2');
      expect(sheet.tweet).to.eql('newTweetValue');
      expect(sheet.handles).to.eql([
        '@handleOne',
        '@handleTwo'
      ]);
    });
  });

});
