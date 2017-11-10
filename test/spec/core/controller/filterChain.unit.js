
const { FilterChain } = require('../../../../core/controller/filterChain');
const { expect, sinon } = require('../../../support/TestUtils');

describe.only('filterChain unit tests', () => {

  it('apply all links in chain until callback', () => {
    let filterChain = new FilterChain({
      chain: [
        { apply: (event, response, next) => next() },
        { apply: (event, response, next) => next() }
      ]
    });
    const event = {};
    return filterChain.wrapInChain(event, response => {
      expect(response).to.eql({
        statusCode: 200
      });
    });
  });

  xit('apply each link until one does not call `next` function', () => {
    let filterChain = new FilterChain({
      chain: [
        { apply: sinon.spy((event, response, next) => {}) },
        { apply: sinon.spy((event, response, next) => next()) }
      ]
    });
  });

});
