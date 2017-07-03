
const dynamodbLocal = require('../dynamodbLocal');

describe('dynamodb local integration tests', () => {

  let dynamodb;

  before(() => {
    dynamodb = dynamodbLocal.start();
  });

  after(() => {
    dynamodbLocal.stop();
  });

  it('local dynamodb started and AWS can connect', function() {
    this.timeout(5000);
    return new Promise((resolve, reject) => {
      dynamodb.createTable({
        TableName: 'temp',
        KeySchema: [
            { AttributeName: 'id', KeyType: 'HASH' }
        ],
        AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' }
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
          }
      }, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  });

});
