
const assembler = require('../../../src/sheets/service/userSheetModelAssembler');
const { expect } = require('../../support/TestUtils');

describe('userSheetModelAssembler unit tests', () => {

  it('null sheetEntity throws error', () => {
    return expect(() => assembler.toModel(null, null))
      .to.throw(/sheetEntity/);
  });

  it('assemble null userSheetEntity with non-null sheetEntity', () => {
    const sheetEntity = {
      Item: {
        id: { S: 'A' },
        tweet: { S: 'tweetValue' },
        handles: {
          L: [{ S: '@handleOne' }, { S: '@handleTwo' }, { S: '@handleX' }]
        }
      }
    };
    const model = assembler.toModel(sheetEntity, null, '1');
    expect(model.userId).to.be.eql('1');
    expect(model.sheetId).to.eql('A');
    expect(model.sheet.id).to.eql('A');
    expect(model.completions).to.eql([
      { 'handle': '@handleOne', 'completed': false },
      { 'handle': '@handleTwo', 'completed': false },
      { 'handle': '@handleX', 'completed': false }
    ]);
  });

  it('assemble model from entity', () => {
    const sheetEntity = {
      Item: {
        id: { S: '1' },
        tweet: { S: 'tweetValue' },
        handles: {
          L: [{ S: '@handleOne' }, { S: '@handleTwo' }, { S: '@handleX' }]
        }
      }
    };
    const userSheetEntity = {
      Item: {
        userId: { S: '1' },
        sheetId: { S: 'A' },
        completions: {
          L: [{ S: '@handleOne' }, { S: '@handleY' }]
        }
      }
    };
    const model = assembler.toModel(sheetEntity, userSheetEntity);
    expect(model.userId).to.eql('1');
    expect(model.sheetId).to.eql('A');
    expect(model.sheet.id).to.eql('1');
    expect(model.completions).to.eql([
      { handle: '@handleOne', completed: true },
      { handle: '@handleTwo', completed: false },
      { handle: '@handleX', completed: false }
    ]);
  });

  it('null model to null entity', () => {
    return expect(assembler.toEntity(null)).to.be.null;
  });

  it('assemble entity from model', () => {
    const model = {
      userId: '1',
      sheetId: 'A',
      sheet: {
        id: '1',
        tweet: 'tweetValue',
        handles: ['@handleOne', '@handleTwo', '@handleX']
      },
      completions: [
        { handle: '@handleOne', completed: true },
        { handle: '@handleTwo', completed: false },
        { handle: '@handleY', completed: true }
      ]
    };
    const entity = assembler.toEntity(model);
    expect(entity.userId).to.eql({ S: '1' });
    expect(entity.sheetId).to.eql({ S: 'A' });
    expect(entity.completions).to.eql({
      L: [{ S: '@handleOne' }, { S: '@handleY' }]
    });
  });

});
