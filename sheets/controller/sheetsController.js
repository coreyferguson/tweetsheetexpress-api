
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
    if (!userIdRequest) return Promise.resolve({
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required body property: userId' })
    });
    if (!sheetIdRequest) return Promise.resolve({
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required body property: sheetId' })
    });

    // validate authentication
    if (!userIdCookie) return Promise.resolve({
      statusCode: 401,
      body: JSON.stringify({ error: 'Missing authentication credentials.' })
    });
    if (userIdRequest !== userIdCookie) return Promise.resolve({
      statusCode: 403,
      body: JSON.stringify({ error: 'You cannot tweet on behalf of someone else.' })
    });

    // tweet all
    return this._userSheetService.tweet(
      userIdRequest,
      sheetIdRequest,
      tokenCookie,
      tokenSecretCookie
    ).then(userSheet => {
      response.body = response.body || {};
      response.body.userSheet = userSheet;
    });

  }

}

// export singleton
const singleton = new SheetsController();
singleton.SheetsController = SheetsController;
module.exports = singleton;
