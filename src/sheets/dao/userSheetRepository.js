
const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-2' });

class UserSheetRepository {

  constructor(options) {
    options = options || {};
    this._dynamodb = options.dynamodb || new AWS.DynamoDB();
    this._usersSheetsTableName = options.usersSheetsTableName || process.env.usersSheetsTableName;
  }

  findOne(userId, sheetId) {
    return new Promise((resolve, reject) => {
      this._dynamodb.getItem({
        TableName: this._usersSheetsTableName,
        Key: {
          userId: { S: userId },
          sheetId: { S: sheetId }
        }
      }, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    }).then(userSheet => {
      return (Object.keys(userSheet).length === 0) ? null : userSheet;
    });
  }

  save(userSheet) {
    return new Promise((resolve, reject) => {
      this._dynamodb.putItem({
        TableName: this._usersSheetsTableName,
        Item: userSheet,
        ReturnConsumedCapacity: 'TOTAL'
      }, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }

}

// export singleton
const singleton = new UserSheetRepository();
singleton.UserSheetRepository = UserSheetRepository;
module.exports = singleton;
