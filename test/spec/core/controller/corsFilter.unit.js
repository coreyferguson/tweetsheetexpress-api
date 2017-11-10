
const corsFilter = require('../../../../core/controller/corsFilter');
const { expect } = require('../../../support/TestUtils');

describe.only('corsFilter unit tests', () => {

  const defaultHeaders = {
    'Access-Control-Allow-Origin': 'https://tweetsheets-test.overattribution.com',
    'Access-Control-Allow-Credentials': true
  };

  it('adds headers', () => {
    const response = {
      statusCode: 200
    };
    corsFilter.apply(
      { headers: { origin: 'https://notmydomain.com' } },
      response
    );
    expect(response).to.eql({
      statusCode: 200,
      headers: defaultHeaders
    });
  });

  it('does not overwrite any existing headers', () => {
    const response = {
      statusCode: 200,
      headers: { 'existingHeaderLabel': 'existingHeaderValue' }
    };
    corsFilter.apply(
      { headers: { origin: 'https://notmydomain.com' } },
      response
    );
    expect(response).to.eql({
      statusCode: 200,
      headers: Object.assign(
        { 'existingHeaderLabel': 'existingHeaderValue' },
        defaultHeaders
      )
    });
  });

});
