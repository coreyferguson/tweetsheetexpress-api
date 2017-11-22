
const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-2' });

class SheetRepository {

  constructor(options) {
    options = options || {};
    this._dynamodb = options.dynamodb || new AWS.DynamoDB();
    this._sheetsTableName = options.sheetsTableName || process.env.sheetsTableName;
  }

  findOne(id) {
    console.info(`SheetRepository.findOne(id): ${id}`);
    return new Promise((resolve, reject) => {
      this._dynamodb.getItem({
        TableName: this._sheetsTableName,
        Key: {
          id: {
            S: id
          }
        }
      }, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    }).then(sheet => {
      return (Object.keys(sheet).length === 0) ? null : sheet;
    });
  }

  save(sheet) {
    console.info(`SheetRepository.save(sheet.id): ${sheet.id}`);
    return new Promise((resolve, reject) => {
      this._dynamodb.putItem({
        TableName: this._sheetsTableName,
        Item: sheet,
        ReturnConsumedCapacity: 'TOTAL'
      }, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }

}

// export singleton
const singleton = new SheetRepository();
singleton.SheetRepository = SheetRepository;
module.exports = singleton;
