
const uuid = require('uuid/v4');
const AWS = require('aws-sdk');

var dynamodb = new AWS.DynamoDB();

/**
 * Create a tweetsheet
 */
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
    if (error) {
      console.log(err, err.stack);
      callback(error);
    } else {
      console.log(`successfully created item: ${id.S}`);
      callback(null, {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true
        },
        body: JSON.stringify({ id: id.S })
      });
    }
  });

};

/**
 * Fetch existing tweetsheet
 */
module.exports.fetch = (event, context, callback) => {

  const id = event.queryStringParameters.id;
  dynamodb.getItem({
    TableName: 'sheets',
    Key: {
      'id': { 'S': id }
    }
  }, (err, data) => {
    if (err) {
      console.log(err, err.stack);
      callback(err);
    } else {
      console.log(`successfully retrieved item: ${id}`)

      const sheet = {};
      sheet.id = data.Item.id.S;
      sheet.handles = data.Item.handles.L.map(item =>  item.S);
      sheet.tweet = data.Item.tweet.S;

      callback(null, {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true
        },
        body: JSON.stringify(sheet)
      });
    }
  });

}
