
const express = require('express');
const config = require('../../../src/config');

class Server {

  constructor(options) {
    options = options || {};
    this._express = options.express || express;
    this._port = options.port || config.test.express.port;
  }

  start() {
    return new Promise(resolve => {
      this._app = this._express();
      this._app.get('/callback', (req, res) => {
        res.status(200).end();
        if (this._callbackResolve) this._callbackResolve(req.query);
      });
      this._appInstance = this._app.listen(this._port, () => {
        resolve(this._port);
      });
    });
  }

  waitForCallback() {
    if (!this._callbackPromise) {
      this._callbackPromise = new Promise(resolve => {
        this._callbackResolve = resolve;
      });
    }
    return this._callbackPromise;
  }

  stop() {
    if (this._appInstance) this._appInstance.close();
  }

}

// Export singleton
const singleton = new Server();
singleton.Server = Server;
module.exports = singleton;
