
const Config = require('../../../config').Config;
const { expect } = require('../../support/TestUtils');

describe('config unit tests', () => {

  it('default environment overloaded by prod environment', () => {
    process.env.stage = 'test';
    let config = new Config();
    expect(config.env.api.domain).to.equal('tweetsheets-api-test.overattribution.com');
    process.env.stage = 'prod';
    config = new Config();
    expect(config.env.api.domain).to.equal('tweetsheets-api.overattribution.com');
  });

});
