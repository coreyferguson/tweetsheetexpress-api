
const phantom = require('phantom');

class Client {

  authorize(url) {
    return this._openPage(url).then(res => {
      return this._allow(res.page).then(() => {
        res.instance.exit();
      });
    });
  }

  _openPage(url) {
    return phantom.create().then(instance => {
      return instance.createPage().then(page => {
        return page.open(url).then(status => {
          return {
            instance,
            page,
            status
          };
        });
      });
    });
  }

  _allow(page) {
    return page.evaluate(function() {
      $('#username_or_email').val('tweetsheetstest');
      $('#password').val('ixaT:zp?69{@');
      $('#oauth_form').submit();
    }).then(() => {
      return new Promise(resolve => setTimeout(resolve, 1000));
    });
  }

}

// export singleton
const singleton = new Client();
singleton.Client = Client;
module.exports = singleton;
