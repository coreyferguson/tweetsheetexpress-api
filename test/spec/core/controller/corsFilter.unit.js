
const corsFilter = require('../../../../core/controller/corsFilter');
const { expect } = require('../../../support/TestUtils');

describe('corsFilter unit tests', () => {

  const defaultHeaders = {
    'Access-Control-Allow-Origin': 'https://tweetsheets-test.overattribution.com',
    'Access-Control-Allow-Credentials': true
  };

  it('does not overwrite any existing headers', () => {
    const response = {
      statusCode: 200,
      headers: { 'existingHeaderLabel': 'existingHeaderValue' }
    };
    return corsFilter.apply(
      { headers: { origin: 'https://notmydomain.com' } },
      response
    ).then(() => {
      expect(response).to.eql({
        statusCode: 200,
        headers: Object.assign(
          { 'existingHeaderLabel': 'existingHeaderValue' },
          defaultHeaders
        )
      });
    });
  });

  it('is not an allowed origin', () => {
    const response = { statusCode: 200 };
    return corsFilter.apply(
      { headers: { origin: 'https://notmydomain.com' } },
      response
    ).then(() => {
      expect(response).to.eql({
        statusCode: 200,
        headers: defaultHeaders
      });
    });
  });

  it('is default origin', () => {
    const response = { statusCode: 200 };
    return corsFilter.apply(
      { headers: { origin: 'https://tweetsheets-test.overattribution.com' } },
      response
    ).then(() => {
      expect(response).to.eql({
        statusCode: 200,
        headers: defaultHeaders
      });
    });
  });

  it('is alternative origin', () => {
    const response = { statusCode: 200 };
    return corsFilter.apply(
      { headers: { origin: 'https://tweetsheets-test2.overattribution.com' } },
      response
    ).then(() => {
      expect(response).to.eql({
        statusCode: 200,
        headers: Object.assign(
          {
            'Access-Control-Allow-Origin':
              'https://tweetsheets-test2.overattribution.com',
          },
          defaultHeaders)
      });
    });
  });

});
