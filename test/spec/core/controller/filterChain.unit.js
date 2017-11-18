
const { FilterChain } = require('../../../../core/controller/filterChain');
const { expect, sinon } = require('../../../support/TestUtils');

describe('filterChain unit tests', () => {

  it('process all filters in chain', () => {
    let filterChain = new FilterChain({
      chain: [
        { process: sinon.spy(() => Promise.resolve(true)) },
        { process: sinon.spy(() => Promise.resolve(true)) }
      ]
    });
    return expect(filterChain.wrapInChain({}))
      .to.eventually.eql({ statusCode: 200 })
      .then(() => {
        expect(filterChain.chain[0].process).to.be.calledOnce;
        expect(filterChain.chain[1].process).to.be.calledOnce;
      });

  });

  it('process all filters in chain + additional filter', () => {
    let filterChain = new FilterChain({
      chain: [
        { process: sinon.spy(() => Promise.resolve(true)) },
        { process: sinon.spy(() => Promise.resolve(true)) }
      ]
    });
    const finalFilter = sinon.spy(() => {});
    return expect(filterChain.wrapInChain({}, finalFilter))
      .to.eventually.eql({ statusCode: 200 })
      .then(() => {
        expect(finalFilter).to.be.calledOnce;
        expect(filterChain.chain[0].process).to.be.calledOnce;
        expect(filterChain.chain[1].process).to.be.calledOnce;
      });
  });

  it('process each filter until one resolves `false`', () => {
    let filterChain = new FilterChain({
      chain: [
        { process: sinon.spy(() => Promise.resolve(true)) },
        { process: sinon.spy(() => Promise.resolve(false)) },
        // will not be called because previous filter in chain resolves `false`
        { process: sinon.spy(() => Promise.resolve(true)) }
      ]
    });
    return expect(filterChain.wrapInChain({}))
      .to.eventually.eql({ statusCode: 200 }).then(() => {
        expect(filterChain.chain[0].process).to.be.calledOnce;
        expect(filterChain.chain[1].process).to.be.calledOnce;
        expect(filterChain.chain[2].process).to.not.be.called;
      });
  });

  it('process each filter until one does not return promise', () => {
    let filterChain = new FilterChain({
      chain: [
        { process: sinon.spy(() => Promise.resolve(true)) },
        { process: sinon.spy(() => {}) },
        // will not be called because previous filter in chain returns no promise
        { process: sinon.spy(() => Promise.resolve(true)) }
      ]
    });
    return expect(filterChain.wrapInChain({}))
      .to.eventually.eql({ statusCode: 200 }).then(() => {
        expect(filterChain.chain[0].process).to.be.calledOnce;
        expect(filterChain.chain[1].process).to.be.calledOnce;
        expect(filterChain.chain[2].process).to.not.be.called;
      });
  });

  it('event passed to each filter', () => {
    const eventPropertyValidator = event => {
      expect(event.testPropertyLabel).to.equal('testPropertyValue');
      return Promise.resolve(true);
    };
    let filterChain = new FilterChain({
      chain: [
        { process: eventPropertyValidator },
        { process: eventPropertyValidator }
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
        { process: responsePropertyValidator },
        { process: responsePropertyValidator }
      ]
    });
    return filterChain.wrapInChain();
  });

  it('response shared by reference to all filters in chain', () => {
    let filterChain = new FilterChain({
      chain: [
        {
          process: (event, response) => {
            expect(response.callCount).to.be.undefined;
            response.callCount = 1;
            return Promise.resolve(true);
          }
        },
        {
          process: (event, response) => {
            expect(response.callCount).to.equal(1);
            response.callCount++;
            return Promise.resolve(true);
          }
        },
        {
          process: (event, response) => {
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

  it('filter chain throws error, reports error + response', () => {
    let filterChain = new FilterChain({
      chain: [
        {
          process: (event, response) => {
            response.filter1Label = 'filter1Value';
            return Promise.resolve(true);
          }
        },
        {
          process: (event, response) => {
            response.filter2Label = 'filter2Value';
            throw new Error('oops, something bad happened');
          }
        }
      ]
    });
    return filterChain.wrapInChain({}).then(() => {
      throw new Error('should not have been fulfilled');
    }).catch(error => {
      expect(error.response).to.eql({
        statusCode: 500,
        body: {
          message: 'Internal Server Error'
        },
        filter1Label: 'filter1Value',
        filter2Label: 'filter2Value'
      });
      expect(error.message).to.eql('oops, something bad happened');
      expect(error.stack).to.not.be.undefined;
    });
  });

  it('final filter should have appropriate `this` context', () => {
    class Controller {
      constructor() {
        this.propertyLabel = 'propertyValue';
      }
      process() {}
    }
    let controller = new Controller();
    const finalFilter = sinon.stub(controller, 'process');
    let filterChain = new FilterChain({
      chain: [
        { process: sinon.spy(() => Promise.resolve(true)) },
        { process: sinon.spy(() => Promise.resolve(true)) }
      ]
    });
    return expect(filterChain.wrapInChain({}, controller.process.bind(controller)))
      .to.eventually.eql({ statusCode: 200 })
      .then(() => {
        expect(finalFilter).to.be.calledOnce;
        expect(filterChain.chain[0].process).to.be.calledOnce;
        expect(filterChain.chain[1].process).to.be.calledOnce;
      });

  });

});
