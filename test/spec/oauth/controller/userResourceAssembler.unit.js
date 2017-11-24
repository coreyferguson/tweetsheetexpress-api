
const assembler = require('../../../../src/oauth/controller/userResourceAssembler');
const { expect } = require('../../../support/TestUtils');

describe('userResourceAssembler unit tests', () => {

  it('null entity to null model', () => {
    expect(assembler.toResource(null)).to.be.null;
  });

  it('assemble resource from model - all properties but secrets', () => {
    const model = {
      id: '881936187492941825',
      screenName: 'screenNameValue',
      token: 'tokenValue',
      tokenSecret: 'tokenSecretValue',
      nextTweetsheetBatch: 'nextTweetsheetBatchValue'
    };
    const resource = assembler.toResource(model);
    expect(resource).to.eql({
      id: '881936187492941825',
      screenName: 'screenNameValue',
      nextTweetsheetBatch: 'nextTweetsheetBatchValue'
    });
    expect(resource.token).to.be.undefined;
    expect(resource.tokenSecret).to.be.undefined;
  });

});
