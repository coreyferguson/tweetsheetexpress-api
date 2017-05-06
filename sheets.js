
const uuid = require('uuid/v4');
const AWS = require('aws-sdk');

var dynamodb = new AWS.DynamoDB();

module.exports.create = (event, context, callback) => {
  dynamodb.putItem({
    Item: {
      "id": { "S": uuid() },
      "handles": { "" }
    }
  })


  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin" : "*",
      "Access-Control-Allow-Credentials" : true
    },
    body: JSON.stringify({
      message: 'Go Serverless v1.0! Your function executed successfully!',
      input: event
    }),
  };
  callback(null, response);
};
