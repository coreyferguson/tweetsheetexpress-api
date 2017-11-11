
const userService = require('../../../../oauth/service/userService');
const userRepository = require('../../../../oauth/dao/userRepository');
const { expect, sinon } = require('../../../support/TestUtils');
const dynamodbLocal = require('../../core/dynamodbLocal');

describe('userService integration test', () => {

  let sandbox = sinon.sandbox.create();
  let dynamodb, usersTableName;

  before(function() {
    this.timeout(5000);
    dynamodb = userRepository._dynamodb;
    usersTableName = userRepository._usersTableName;
    let newDynamoDb = dynamodbLocal.start();
    userRepository._dynamodb = newDynamoDb;
    userRepository._usersTableName = 'users-test';
    return dynamodbLocal.createTable('usersTable', 'users-test');
  });

  after(() => {
    userRepository._dynamodb = dynamodb;
    userRepository._usersTableName = usersTableName;
    dynamodbLocal.stop();
  });

  beforeEach(() => {
    sandbox.stub(console, 'info');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('findOne - no existing user', () => {
    return expect(userService.findOne('1234')).to.eventually.be.null;
  });

  it('save - new user', () => {
    return userService.save({
      id: '1234',
      screenName: 'screenNameValue'
    }).then(() => {
      return userService.findOne('1234').then(user => {
        expect(user.id).to.eql('1234');
        expect(user.screenName).to.eql('screenNameValue');
      });
    });
  });

  it('save - existing user', () => {
    return userService.save({
      id: '1234',
      screenName: 'oldValue'
    }).then(() => {
      return userService.save({
        id: '1234',
        screenName: 'newValue'
      });
    }).then(() => {
      return userService.findOne('1234').then(user => {
        expect(user.id).to.eql('1234');
        expect(user.screenName).to.eql('newValue');
      });
    });
  });

  it('isAuthenticated - userId not given', () => {
    return expect(userService.isAuthenticated(undefined, 'token', 'tokenSecret'))
      .to.eventually.be.false;
  });

  it('isAuthenticated - token not given', () => {
    return expect(userService.isAuthenticated('1234', undefined, 'tokenSecret'))
      .to.eventually.be.false;
  });

  it('isAuthenticated - tokenSecret not given', () => {
    return expect(userService.isAuthenticated('1234', 'token', undefined))
      .to.eventually.be.false;
  });

  it('isAuthenticated - token does not match', () => {
    return userService.save({
      id: '1234',
      token: 'token',
      tokenSecret: 'tokenSecret'
    }).then(() => {
      return expect(userService.isAuthenticated(
        '1234',
        'invalidToken',
        'tokenSecret'
      )).to.eventually.be.false;
    });
  });

  it('isAuthenticated - tokenSecret does not match', () => {
    return userService.save({
      id: '1234',
      token: 'token',
      tokenSecret: 'tokenSecret'
    }).then(() => {
      return expect(userService.isAuthenticated(
        '1234',
        'token',
        'invalidTokenSecret'
      )).to.eventually.be.false;
    });
  });

  it('isAuthenticated - user is authenticated', () => {
    return userService.save({
      id: '1234',
      token: 'token',
      tokenSecret: 'tokenSecret'
    }).then(() => {
      return expect(userService.isAuthenticated(
        '1234',
        'token',
        'tokenSecret'
      )).to.eventually.be.true;
    });
  });

});
