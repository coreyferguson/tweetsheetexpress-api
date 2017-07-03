
const { FilterChain } = require('../../../../core/controller/filterChain');

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

});
