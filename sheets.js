
const uuid = require('uuid/v4');
const AWS = require('aws-sdk');

var dynamodb = new AWS.DynamoDB();

module.exports.create = (event, context, callback) => {

  const payload = JSON.parse(event.body);
  console.log('payload:', payload);

  const id = { "S": uuid() };
  const handles = {
    "L": payload.handles.map(value => {
      return { "S": value };
    })
  };
  const tweet = { "S": payload.tweet };

  dynamodb.putItem({
    TableName: "sheets",
    Item: { id, handles, tweet }
  }, (error, data) => {
    if (error) callback(error);
    else {
      console.log(`successfully created item: ${id.S}`);
      callback(null, {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin" : "*",
          "Access-Control-Allow-Credentials" : true
        },
        body: JSON.stringify({ id: id.S })
      });
    }
  });

};
