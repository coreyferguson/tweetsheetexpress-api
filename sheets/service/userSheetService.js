
const bluebird = require('bluebird');
const assembler = require('./userSheetModelAssembler');
const sheetRepository = require('../dao/sheetRepository');
const twitterService = require('../../twitter/service/twitterService');
const userSheetRepository = require('../dao/userSheetRepository');
const userService = require('../../oauth/service/userService');
const config = require('../../config');

class UserSheetService {

  constructor(options) {
    options = options || {};
    this._assembler = options.assembler || assembler;
    this._sheetRepository = options.sheetRepository || sheetRepository;
    this._twitterService = options.twitterService || twitterService;
    this._userSheetRepository = options.userSheetRepository || userSheetRepository;
    this._userService = options.userService || userService;
  }

  findOne(userId, sheetId) {
    return Promise.all([
      this._sheetRepository.findOne(sheetId),
      this._userSheetRepository.findOne(userId, sheetId)
    ]).then(([ sheetEntity, userSheetEntity ]) => {
      return (sheetEntity)
        ? this._assembler.toModel(sheetEntity, userSheetEntity, userId)
        : null;
    });
  }

  save(sheet) {
    const entity = this._assembler.toEntity(sheet);
    return this._userSheetRepository.save(entity);
  }

  tweet(userId, sheetId, token, tokenSecret) {
    console.info('userSheetService.tweet(userId, sheetId, token, tokenSecret):', userId, sheetId, token, tokenSecret)
    return Promise.all([
      this._userService.findOne(userId),
      this.findOne(userId, sheetId)
    ]).then(responses => {
      const [ user, userSheet ] = responses;
      return this._isUserThrottled(user).then(throttled => {
        if (!throttled) return this._tweetAll(userSheet, token, tokenSecret).then(() => {
          return this.save(userSheet);
        }).then(() => {
          return this._throttleUser(user);
        }).then(() => {
          return userSheet;
        });
      });
    });
  }

  _isUserThrottled(user) {
    const nextTweetsheetBatch = new Date(user.nextTweetsheetBatch);
    const now = new Date();
    const msRemaining = nextTweetsheetBatch.getTime() - now.getTime();
    return (msRemaining >= 0)
      ? Promise.resolve(true)
      : Promise.resolve(false);
  }

  _throttleUser(user) {
    const throttleDelayInSeconds = config.env.api.batch.throttleDelayInSeconds;
    const throttleDelayInMs = 1000 * throttleDelayInSeconds;
    user.nextTweetsheetBatch =
      new Date(
        new Date().getTime() + throttleDelayInMs
      ).toISOString();
    return this._userService.save(user);
  }

  _tweetAll(userSheet, token, tokenSecret) {
    const incomplete = userSheet.completions
      .filter(completion => !completion.completed);
    return bluebird.mapSeries(incomplete, (item, index) => {
      if (index < config.env.api.batch.size) return this._tweetOnce(
        item.handle,
        userSheet.sheet.tweet,
        token,
        tokenSecret
      ).then(() => {
        item.completed = true;
      });
    }).then(() => {
      return userSheet;
    });
  }

  _tweetOnce(handle, tweetTemplate, token, tokenSecret) {
    const tweet = tweetTemplate.replace(new RegExp('@handle', 'g'), handle);
    let tweeted = false;
    let error;
    return this._twitterService
      .tweet(token, tokenSecret, tweet)
      .catch(err => {
        if (err.statusCode === 403
            && err.error.match(/Status is a duplicate/)) {
          // do nothing, this is considered a success
        } else {
          // TODO: handle this:
          /*
          {
            "name": "StatusCodeError",
            "statusCode": 403,
            "message": "403 - \"{\\\"errors\\\":[{\\\"message\\\":\\\"Application cannot perform write actions. Contact Twitter Platform Operations through https://support.twitter.com/forms/platform\\\",\\\"code\\\":261}]}\"",
            "error": "{\"errors\":[{\"message\":\"Application cannot perform write actions. Contact Twitter Platform Operations through https://support.twitter.com/forms/platform\",\"code\":261}]}",
            "options": {
                "url": "https://api.twitter.com/1.1/statuses/update.json",
                "oauth": {
                    "consumer_key": "v3D4GX94NO6R2DGzxQ3DKOWam",
                    "consumer_secret": "WrE5XWfCIMq5GSxwUFUxXqHVj9TfW1b6vEolVYcuMCD2WMBumK",
                    "token": "22663908-Ngek1QPbengMctv5I0J2PJkvSPunW8aimZRqR5siL",
                    "token_secret": "RQOxrCCyOdMEVNQjgs3ZzWfiNXZJP0mNwJCTTQlMNH7i5"
                },
                "qs": {
                    "status": ".@repraulgrijalva, please cosponsor #HR1406 to outlaw dog & cat meat in the 44 United States where it is legal. https://t.co/7k3FiLnzvi"
                },
                "method": "POST",
                "simple": true,
                "resolveWithFullResponse": false,
                "transform2xxOnly": false
            },
            "response": {
                "statusCode": 403,
                "body": "{\"errors\":[{\"message\":\"Application cannot perform write actions. Contact Twitter Platform Operations through https://support.twitter.com/forms/platform\",\"code\":261}]}",
                "headers": {
                    "connection": "close",
                    "content-length": "166",
                    "content-type": "application/json;charset=utf-8",
                    "date": "Wed, 19 Jul 2017 03:06:01 GMT",
                    "server": "tsa_a",
                    "set-cookie": [
                        "guest_id=v1%3A150043356185802055; Domain=.twitter.com; Path=/; Expires=Fri, 19-Jul-2019 03:06:01 UTC"
                    ],
                    "strict-transport-security": "max-age=631138519",
                    "x-connection-hash": "6fd6c9aba90efb29bf7247bed4112e5d",
                    "x-response-time": "7"
                },
                "request": {
                    "uri": {
                        "protocol": "https:",
                        "slashes": true,
                        "auth": null,
                        "host": "api.twitter.com",
                        "port": null,
                        "hostname": "api.twitter.com",
                        "hash": null,
                        "search": "?status=.%40repraulgrijalva%2C%20please%20cosponsor%20%23HR1406%20to%20outlaw%20dog%20%26%20cat%20meat%20in%20the%2044%20United%20States%20where%20it%20is%20legal.%20https%3A%2F%2Ft.co%2F7k3FiLnzvi",
                        "query": "status=.%40repraulgrijalva%2C%20please%20cosponsor%20%23HR1406%20to%20outlaw%20dog%20%26%20cat%20meat%20in%20the%2044%20United%20States%20where%20it%20is%20legal.%20https%3A%2F%2Ft.co%2F7k3FiLnzvi",
                        "pathname": "/1.1/statuses/update.json",
                        "path": "/1.1/statuses/update.json?status=.%40repraulgrijalva%2C%20please%20cosponsor%20%23HR1406%20to%20outlaw%20dog%20%26%20cat%20meat%20in%20the%2044%20United%20States%20where%20it%20is%20legal.%20https%3A%2F%2Ft.co%2F7k3FiLnzvi",
                        "href": "https://api.twitter.com/1.1/statuses/update.json?status=.%40repraulgrijalva%2C%20please%20cosponsor%20%23HR1406%20to%20outlaw%20dog%20%26%20cat%20meat%20in%20the%2044%20United%20States%20where%20it%20is%20legal.%20https%3A%2F%2Ft.co%2F7k3FiLnzvi"
                    },
                    "method": "POST",
                    "headers": {
                        "Authorization": "OAuth oauth_consumer_key=\"v3D4GX94NO6R2DGzxQ3DKOWam\",oauth_nonce=\"44f3db7986a445c4a3a674d398679df4\",oauth_signature_method=\"HMAC-SHA1\",oauth_timestamp=\"1500433561\",oauth_token=\"22663908-Ngek1QPbengMctv5I0J2PJkvSPunW8aimZRqR5siL\",oauth_version=\"1.0\",oauth_signature=\"2tOzsavWEehz3n19pJ1C9ik2Xs4%3D\"",
                        "content-length": 0
                    }
                }
            }
          }
          */
          throw err;
        }
      });
  }

}

// export singleton
const singleton = new UserSheetService();
singleton.UserSheetService = UserSheetService;
module.exports = singleton;
