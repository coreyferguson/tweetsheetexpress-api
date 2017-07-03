
const { expect } = require('../../support/TestUtils');
const SheetRepository = require('../../../sheets/dao/sheetRepository').SheetRepository;
const dynamodbLocal = require('../core/dynamodbLocal');

describe('sheetRepository integration tests', () => {

  let dynamodb;
  let sheetRepository;

  before(function() {
    this.timeout(5000);
    dynamodb = dynamodbLocal.start();
    sheetRepository = new SheetRepository({
      dynamodb,
      sheetsTableName: 'sheets-test'
    });
    return dynamodbLocal.createTable('sheetsTable', 'sheets-test');
  });

  after(() => {
    dynamodbLocal.stop();
  });

  it('findOne - sheet does not exist', () => {
    return expect(sheetRepository.findOne('1')).to.eventually.be.null;
  });

  it('save - new sheet', () => {
    const sheet = {
      id: { S: '1' },
      title: { S: 'titleValue' },
      description: { S: 'descriptionValue', },
      tweet: { S: 'tweetValue' },
      handles: {
        L: [{
          S: '@handleOne'
        }, {
          S: '@handleTwo'
        }]
      }
    };
    return sheetRepository.save(sheet).then(() => {
      return expect(sheetRepository.findOne('1'))
        .to.eventually.eql({ Item: sheet });
    });
  });

  it('save - existing sheet', () => {
    const oldSheet = {
      id: { S: '2' },
      tweet: { S: 'oldValue' }
    };
    const newSheet = {
      id: { S: '2' },
      tweet: { S: 'newValue' }
    };
    return sheetRepository.save(oldSheet).then(() => {
      return sheetRepository.save(newSheet);
    }).then(() => {
      return expect(sheetRepository.findOne('2'))
        .to.eventually.eql({ Item: newSheet });
    });
  });

});
