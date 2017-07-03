
const { expect } = require('../../../support/TestUtils');
const UserRepository = require('../../../../oauth/dao/userRepository').UserRepository;
const dynamodbLocal = require('../../core/dynamodbLocal');

describe('userRepository integration tests', () => {

  let dynamodb;
  let userRepository;

  before(function() {
    this.timeout(5000);
    dynamodb = dynamodbLocal.start();
    userRepository = new UserRepository({
      dynamodb,
      usersTableName: 'users-test'
    });
    return dynamodbLocal.createTable('usersTable', 'users-test');
  });

  after(() => {
    dynamodbLocal.stop();
  });

  it('findOne - user does not exist', () => {
    return expect(userRepository.findOne('1234')).to.eventually.be.null;
  });

  it('save - new user', () => {
    const user = {
      id: { S: '1234' }
    };
    return userRepository.save(user).then(() => {
      return expect(userRepository.findOne('1234'))
        .to.eventually.eql({ Item: user });
    });
  });

  it('save - existing user', () => {
    const nextTweetsheetBatch = new Date().toISOString();

    const oldUser = {
      id: { S: '1234' },
      nextTweetsheetBatch: { S: nextTweetsheetBatch }
    };
    const updatedUser = {
      id: { S: '1234' },
      nextTweetsheetBatch: { S: nextTweetsheetBatch }
    };
    return userRepository.save(oldUser).then(() => {
      return userRepository.save(updatedUser);
    }).then(() => {
      return expect(userRepository.findOne('1234'))
        .to.eventually.eql({ Item: updatedUser });
    });
  });

});
