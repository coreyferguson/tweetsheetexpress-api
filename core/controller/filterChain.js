
const bluebird = require('bluebird');
const chain = require('./filterChainConfig');

class FilterChain {

  constructor(options) {
    options = options || {};
    this.chain = options.chain || chain;
  }

  wrapInChain(event, filter) {
    const response = { statusCode: 200 };
    const chain = (filter != null)
      ? [ ...this.chain, { apply: filter } ]
      : this.chain;
    let index = 0;
    const callback = () => Promise.resolve(response);
    const applyNextFilter = () => {
      if (index === chain.length) return callback();
      const promise = chain[index++].apply(event, response);
      if (!promise) return callback();
      return promise.then(shouldContinue => {
        if (shouldContinue) return applyNextFilter();
        else return callback();
      }).catch(error => {
        const newError = new Error(error);
        response.statusCode = 500;
        response.body = { message: 'Internal Server Error' }
        newError.response = response;
        throw newError;
      });
    };
    return applyNextFilter();
  }

}

module.exports = new FilterChain();
module.exports.FilterChain = FilterChain;
