
const { FilterChain } = require('../../../../core/controller/filterChain');
const { expect, sinon } = require('../../../support/TestUtils');

describe.only('filterChain unit tests', () => {

  it('apply all links in chain until callback', () => {
    let filterChain = new FilterChain({
      chain: [
        { apply: sinon.spy((event, response) => Promise.resolve(true)) },
        { apply: sinon.spy((event, response) => Promise.resolve(true)) }
      ]
    });
    return expect(filterChain.wrapInChain({}))
      .to.eventually.eql({ statusCode: 200 })
      .then(() => {
        expect(filterChain.chain[0].apply).to.be.calledOnce;
        expect(filterChain.chain[1].apply).to.be.calledOnce;
      });
  });

  it('apply each link until one resolves `false`', () => {
    let filterChain = new FilterChain({
      chain: [
        { apply: sinon.spy((event, response) => Promise.resolve(true)) },
        { apply: sinon.spy((event, response) => Promise.resolve(false)) },
        // will not be called because previous link in chain resolves `false`
        { apply: sinon.spy((event, response) => Promise.resolve(true)) }
      ]
    });
    return expect(filterChain.wrapInChain({}))
      .to.eventually.eql({ statusCode: 200 }).then(() => {
        expect(filterChain.chain[0].apply).to.be.calledOnce;
        expect(filterChain.chain[1].apply).to.be.calledOnce;
        expect(filterChain.chain[2].apply).to.not.be.called;
      });
  });

  it('apply each link until one does not return promise', () => {
    let filterChain = new FilterChain({
      chain: [
        { apply: sinon.spy((event, response) => Promise.resolve(true)) },
        { apply: sinon.spy((event, response) => {}) },
        // will not be called because previous link in chain resolves `false`
        { apply: sinon.spy((event, response) => Promise.resolve(true)) }
      ]
    });
    return expect(filterChain.wrapInChain({}))
      .to.eventually.eql({ statusCode: 200 }).then(() => {
        expect(filterChain.chain[0].apply).to.be.calledOnce;
        expect(filterChain.chain[1].apply).to.be.calledOnce;
        expect(filterChain.chain[2].apply).to.not.be.called;
      });
  });

  it('event passed to each link', () => {
    const eventPropertyValidator = (event, response) => {
      expect(event.testPropertyLabel).to.equal('testPropertyValue');
      return Promise.resolve(true);
    };
    let filterChain = new FilterChain({
      chain: [
        { apply: eventPropertyValidator },
        { apply: eventPropertyValidator }
      ]
    });
    return filterChain.wrapInChain({ testPropertyLabel: 'testPropertyValue' });
  });

  it('response default values', () => {
    const responsePropertyValidator = (event, response) => {
      expect(response.statusCode).to.equal(200);
      return Promise.resolve(true);
    };
    let filterChain = new FilterChain({
      chain: [
        { apply: responsePropertyValidator },
        { apply: responsePropertyValidator }
      ]
    });
    return filterChain.wrapInChain();
  });

  it('response shared by reference to all links in chain', () => {
    let filterChain = new FilterChain({
      chain: [
        {
          apply: (event, response) => {
            expect(response.callCount).to.be.undefined;
            response.callCount = 1;
            return Promise.resolve(true);
          }
        },
        {
          apply: (event, response) => {
            expect(response.callCount).to.equal(1);
            response.callCount++;
            return Promise.resolve(true);
          }
        },
        {
          apply: (event, response) => {
            expect(response.callCount).to.equal(2);
            response.callCount++;
            return Promise.resolve(true);
          }
        }
      ]
    });
    return expect(filterChain.wrapInChain())
      .to.eventually.eql({
        statusCode: 200,
        callCount: 3
      });
  });

});
