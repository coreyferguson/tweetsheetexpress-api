
const assembler = require('../../../src/sheets/service/sheetModelAssembler');
const { expect, sinon } = require('../../support/TestUtils');

describe('sheetModelAssembler unit tests', () => {

  const sandbox = sinon.sandbox.create();

  before(() => {
    sandbox.stub(console, 'info');
  });

  after(() => {
    sandbox.restore();
  });

  it('null entity to null model', () => {
    return expect(assembler.toModel(null)).to.be.null;
  });

  it('assemble model from entity - all properties', () => {
    const entity = {
      Item: {
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
      }
    };
    return expect(assembler.toModel(entity)).to.eql({
      id: '1',
      title: 'titleValue',
      description: 'descriptionValue',
      tweet: 'tweetValue',
      handles: [
        '@handleOne',
        '@handleTwo'
      ]
    });
  });

  it('assemble model from entity - required properties', () => {
    const entity = {
      Item: {
        id: { S: '1' },
        tweet: { S: 'tweetValue' },
        handles: {
          L: [{
            S: '@handleOne'
          }, {
            S: '@handleTwo'
          }]
        }
      }
    };
    const model = assembler.toModel(entity);
    expect(model.id).to.eql('1');
    expect(model.tweet).to.eql('tweetValue');
    expect(model.handles).to.eql([
      '@handleOne',
      '@handleTwo'
    ]);
  });

  it('null model to null entity', () => {
    return expect(assembler.toEntity(null)).to.be.null;
  });

  it('assemble entity from model - all properties', () => {
    const model = {
      id: '1',
      title: 'titleValue',
      description: 'descriptionValue',
      tweet: 'tweetValue',
      handles: [
        '@handleOne',
        '@handleTwo'
      ]
    };
    expect(assembler.toEntity(model)).to.eql({
      id: { S: '1' },
      title: { S: 'titleValue' },
      description: { S: 'descriptionValue' },
      tweet: { S: 'tweetValue' },
      handles: {
        L: [
          { S: '@handleOne' },
          { S: '@handleTwo' }
        ]
      }
    });
  });

  it('assemble entity from model - required properties', () => {
    const model = {
      id: '1',
      tweet: 'tweetValue',
      handles: [
        '@handleOne',
        '@handleTwo'
      ]
    };
    const entity = assembler.toEntity(model);
    expect(entity.id).to.eql({ S: '1' });
    expect(entity.tweet).to.eql({ S: 'tweetValue' });
    expect(entity.handles).to.eql({
      L: [
        { S: '@handleOne' },
        { S: '@handleTwo' }
      ]
    });
  });

});
