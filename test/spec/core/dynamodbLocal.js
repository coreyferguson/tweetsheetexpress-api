
const AWS = require('aws-sdk');
const fs = require('fs');
const localDynamo = require('local-dynamo');
const path = require('path');
const yaml = require('js-yaml');

class DynamoDbLocal {

  start() {
    this._oldRegion = AWS.config.region;
    this._oldEndpoint = AWS.config.endpoint;
    AWS.config.update({
      region: 'us-west-2',
      endpoint: 'http://localhost:8000'
    });
    // start an in-memory dynamodb database
    this._localDynamoProcess = localDynamo.launch({
      port: 8000,
      dir: null
    });
    this._dynamodb = new AWS.DynamoDB();
    return this._dynamodb;
  }

  stop() {
    this._localDynamoProcess.kill();
    AWS.config.region = this._oldRegion;
    AWS.config.endpoint = this._oldEndpoint;
    // AWS.config.dynamodb = this._oldDynamoDbConfig;
  }

  createTable(resourceName, tableName) {
    return this._loadResource(resourceName).then(resource => {
      return this._createTable(resource, tableName);
    });
  }

  _createTable(resource, tableName) {
    return new Promise((resolve, reject) => {
      this._dynamodb.createTable({
        TableName: tableName,
        KeySchema: resource.Properties.KeySchema,
        AttributeDefinitions: resource.Properties.AttributeDefinitions,
        ProvisionedThroughput: resource.Properties.ProvisionedThroughput
      }, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }

  _loadResource(resource) {
    return new Promise((resolve, reject) => {
      const serverlessYmlPath = path.resolve(
        __dirname,
        '../../..',
        'serverless.yml');
      fs.readFile(serverlessYmlPath, 'utf8', (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    }).then(data => {
      return yaml.safeLoad(data);
    }).then(data => {
      return data.resources.Resources[resource];
    });
  }

}

// export singleton
const singleton = new DynamoDbLocal();
singleton.DynamoDbLocal = DynamoDbLocal;
singleton.AWS = AWS;
module.exports = singleton;
