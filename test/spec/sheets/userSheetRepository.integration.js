
const { expect } = require('../../support/TestUtils');
const UserSheetRepository = require('../../../sheets/dao/userSheetRepository').UserSheetRepository;
const dynamodbLocal = require('../core/dynamodbLocal');

describe('userSheetRepository integration tests', () => {

  let dynamodb;
  let repository;

  before(function() {
    this.timeout(5000);
    dynamodb = dynamodbLocal.start();
    repository = new UserSheetRepository({
      dynamodb,
      usersSheetsTableName: 'usersSheets-test'
    });
    return dynamodbLocal.createTable('usersSheetsTable', 'usersSheets-test');
  });

  after(() => {
    dynamodbLocal.stop();
  });

  it('findOne - sheet does not exist', () => {
    return expect(repository.findOne('1', '2')).to.eventually.be.null;
  });

  it('save - new userSheet', () => {
    const userSheet = {
      userId: { S: '1' },
      sheetId: { S: 'A' },
      completions: {
        L: [{
          S: '@handleOne'
        }, {
          S: '@handleTwo'
        }]
      }
    };
    return repository.save(userSheet).then(() => {
      return expect(repository.findOne('1', 'A'))
        .to.eventually.eql({ Item: userSheet });
    });
  });

  it('save - existing sheet', () => {
    const oldUserSheet = {
      userId: { S: '1' },
      sheetId: { S: 'B' },
      completions: {
        L: [{
          S: '@handleOne'
        }]
      }
    };
    const newUserSheet = {
      userId: { S: '1' },
      sheetId: { S: 'B' },
      completions: {
        L: [{
          S: '@handleOne'
        }, {
          S: '@newHandle'
        }]
      }
    };
    return repository.save(oldUserSheet).then(() => {
      return repository.save(newUserSheet);
    }).then(() => {
      return expect(repository.findOne('1', 'B'))
        .to.eventually.eql({ Item: newUserSheet });
    });
  });

});
