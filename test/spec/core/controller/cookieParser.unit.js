
const cookieParser = require('../../../../src/core/controller/cookieParser');
const { expect } = require('../../../support/TestUtils');

describe('cookie parser unit tests', () => {

  it('null event -> null return value', () => {
    expect(cookieParser.cookiesToJson(null)).to.be.eql({});
  });

  it('no headers -> null return value', () => {
    expect(cookieParser.cookiesToJson({})).to.be.eql({});
  });

  it('no Cookie header -> null return value', () => {
    expect(cookieParser.cookiesToJson({ headers: {} })).to.be.eql({});
  });

  it('single cookie value to map', () => {
    expect(cookieParser.cookiesToJson({
      headers: { Cookie: 'cookieLabel1=foo' }
    })).to.be.eql({
      cookieLabel1: 'foo'
    });
  });

  it('multiple cookie values to map', () => {
    expect(cookieParser.cookiesToJson({
      headers: { Cookie: 'cookieLabel1=foo; cookieLabel2=bar' }
    })).to.be.eql({
      cookieLabel1: 'foo',
      cookieLabel2: 'bar'
    });
  });

  it('multiple cookie values with spaces', () => {
    expect(cookieParser.cookiesToJson({
      headers: { Cookie: 'cookieLabel1=foo bar; cookieLabel2=roger roger' }
    })).to.be.eql({
      cookieLabel1: 'foo bar',
      cookieLabel2: 'roger roger'
    });
  });

});
