
const path = require('path');
const ymlParser = require('../core/ymlParser');

/**
 * Properties:
 * - default: default properties for all environments
 * - env: properties for current environment
 */
class Config {

  constructor(options) {
    options = options || {};
    this._ymlParser = options.ymlParser || ymlParser;
    this._stage = options.stage || process.env.stage;
    // layer environment config on top of default
    this.all = this._ymlParser.parse(path.join(__dirname, './environment-config.yml'));
    this.test = this.all.test;
    this.preprod = this.all.preprod;
    this.env = Object.assign({}, this.preprod, this.all[this._stage]);
  }

}

// export singleton
module.exports = new Config();
module.exports.Config = Config;
