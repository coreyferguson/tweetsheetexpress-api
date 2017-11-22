
const chain = require('./filterChainConfig');

class FilterChain {

  constructor(options) {
    options = options || {};
    this.chain = options.chain || chain;
  }

  wrapInChain(event, filter) {
    console.info('filterChain.wrapInChain');
    const response = { statusCode: 200 };
    const chain = (filter != null)
      ? [ ...this.chain, { process: filter } ]
      : this.chain;
    let index = 0;
    const callback = () => Promise.resolve(response);
    const processNextFilter = () => {
      console.info('filterChain.wrapInChain processNextFilter index:', index);
      if (index === chain.length) return callback();
      const promise = chain[index++].process(event, response);
      if (!promise) return callback();
      return promise.then(shouldContinue => {
        if (shouldContinue) return processNextFilter();
        else return callback();
      }).catch(error => {
        console.info('filterChain.wrapInChain ERROR');
        response.statusCode = 500;
        response.body = { message: 'Internal Server Error' };
        error.response = response;
        throw error;
      });
    };
    return processNextFilter();
  }

}

module.exports = new FilterChain();
module.exports.FilterChain = FilterChain;
