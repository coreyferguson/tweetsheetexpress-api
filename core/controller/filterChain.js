
const bluebird = require('bluebird');
const chain = require('./filterChainConfig');

class FilterChain {

  constructor(options) {
    options = options || {};
    this.chain = options.chain || chain;
  }

  wrapInChain(event) {
      const response = { statusCode: 200 };
      let index = 0;
      const callback = () => Promise.resolve(response);
      const applyNextLink = () => {
        if (index === this.chain.length) return callback();
        const promise = this.chain[index++].apply(event, response);
        if (!promise) return callback();
        return promise.then(shouldContinue => {
          if (shouldContinue) return applyNextLink();
          else return callback();
        });
      };
      return applyNextLink();
  }

}

module.exports = new FilterChain();
module.exports.FilterChain = FilterChain;
