
const chai = require('chai');
const sinonLib = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const chaiString = require('chai-string');

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.use(chaiString);

module.exports = {
  expect: chai.expect,
  sinon: sinonLib
};
