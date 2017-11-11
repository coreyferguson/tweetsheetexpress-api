
const bluebird = require('bluebird');
const path = require('path');
const cookieParser = require('../../core/controller/cookieParser');
const userSheetService = require('../service/userSheetService');
const ymlParser = require('../../core/ymlParser');

class SheetsController {

  constructor(options) {
    options = options || {};
    this._cookieParser = options.cookieParser || cookieParser;
    this._userSheetService = options.userSheetService || userSheetService;
    this._ymlParser = options.ymlParser || ymlParser;
    this._errors = this._ymlParser.parse(path.resolve(__dirname, 'errors.yml'));
  }

  tweet(event, response) {

    // parse cookies
    const cookies = this._cookieParser.cookiesToJson(event);
    const cookieProps = this._ymlParser.parse(path.resolve(
      __dirname, '../../oauth/cookies.yml'));
    const userIdCookie = cookies[cookieProps.userIdLabel];
    const tokenCookie = cookies[cookieProps.tokenLabel];
    const tokenSecretCookie = cookies[cookieProps.tokenSecretLabel];

    // parse body
    const body =  JSON.parse(event.body);
    const userIdRequest = body.userId || userIdCookie;
    const sheetIdRequest = body.sheetId;

    // validate input
    console.info('userIdRequest:', userIdRequest);
    if (!userIdRequest) {
      response.statusCode = 400;
      response.body = { message: 'Missing required body property: userId' };
      return Promise.resolve(false);
    }
    if (!sheetIdRequest) {
      response.statusCode = 400;
      response.body = { message: 'Missing required body property: sheetId' };
      return Promise.resolve(false);
    }

    // validate authentication
    if (!userIdCookie) {
      response.statusCode = 401;
      response.body = { message: 'Missing authentication credentials.' };
      return Promise.resolve(false);
    }
    if (userIdRequest !== userIdCookie) {
      response.statusCode = 403;
      response.body = { message: 'You cannot tweet on behalf of someone else.' }
      return Promise.resolve(false);
    }

    // tweet all
    return this._userSheetService.tweet(
      userIdRequest,
      sheetIdRequest,
      tokenCookie,
      tokenSecretCookie
    ).then(userSheet => {
      response.body = response.body || {};
      response.body.userSheet = userSheet;
      return true;
    });

  }

}

// export singleton
const singleton = new SheetsController();
singleton.SheetsController = SheetsController;
module.exports = singleton;
