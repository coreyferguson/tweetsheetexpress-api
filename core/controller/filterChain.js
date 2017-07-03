
const bluebird = require('bluebird');
const chain = require('./filterChainConfig');

class FilterChain {

  constructor(options) {
    options = options || {};
    this.chain = options.chain || chain;
  }

  wrapInChain(event, callback) {
    const response = { statusCode: 200 };
    let index = 0;
    const next = () => {
      const nextFinal =
        (index < this.chain.length-1)
        ? next
        : () => Promise.resolve();
      if (index < this.chain.length)
        return this.chain[index++].apply(event, response, nextFinal);
    }
    return next();
  }

}

module.exports = new FilterChain();
module.exports.FilterChain = FilterChain;
