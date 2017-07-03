
const { expect } = require('../../../support/TestUtils');
const userModelAssembler = require('../../../../oauth/service/userModelAssembler');

describe('userModelAssembler unit tests', () => {

  it('null model from null entity', () => {
    const model = userModelAssembler.toModel(null);
    expect(model).to.be.null;
  });

  it('assemble model from entity - all properties', () => {
    const model = userModelAssembler.toModel({
      Item: {
        id: { S: '881936187492941825' },
        screenName: { S: 'screenNameValue' },
        token: { S: 'tokenValue' },
        tokenSecret: { S: 'tokenSecretValue' },
        nextTweetsheetBatch: { S: 'nextTweetsheetBatchValue' }
      }
    });
    expect(model).to.eql({
      id: '881936187492941825',
      screenName: 'screenNameValue',
      token: 'tokenValue',
      tokenSecret: 'tokenSecretValue',
      nextTweetsheetBatch: 'nextTweetsheetBatchValue'
    });
  });

  it('assmble model from entity - required properties', () => {
    const model = userModelAssembler.toModel({
      Item: {
        id: {
          S: '881936187492941825'
        }
      }
    });
    expect(model).to.have.property('id', '881936187492941825');
  });

  it('null entity from null model', () => {
    const entity = userModelAssembler.toEntity(null);
    expect(entity).to.be.null;
  });

  it('assemble entity from model - all properties', () => {
    const entity = userModelAssembler.toEntity({
      id: '881936187492941825',
      screenName: 'screenNameValue',
      token: 'tokenValue',
      tokenSecret: 'tokenSecretValue',
      nextTweetsheetBatch: 'nextTweetsheetBatchValue'
    });
    expect(entity).to.eql({
      id: { S: '881936187492941825' },
      screenName: { S: 'screenNameValue' },
      token: { S: 'tokenValue' },
      tokenSecret: { S: 'tokenSecretValue' },
      nextTweetsheetBatch: { S: 'nextTweetsheetBatchValue' }
    });
  });

  it('assemble entity from model - required properties', () => {
    const entity = userModelAssembler.toEntity({
      id: '881936187492941825'
    });
    expect(entity.id).to.have.property('S', '881936187492941825');
  });

});
