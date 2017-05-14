
const uuid = require('uuid/v4');
const AWS = require('aws-sdk');
const csv = require('csv-stringify');

var dynamodb = new AWS.DynamoDB();

/**
 * Create a tweetsheet
 */
module.exports.create = (event, context, callback) => {

  const payload = JSON.parse(event.body);
  console.log('payload:', payload);

  const id = { S: uuid() };
  const title = (payload.title && payload.title !== '')
    ? { S: payload.title }
    : null;
  const description = (payload.description && payload.description !== '')
    ? { S: payload.description }
    : null;
  const handles = {
    L: payload.handles.map(value => {
      return { S: value };
    })
  };
  const tweet = { S: payload.tweet };

  dynamodb.putItem({
    TableName: process.env.sheetsTableName,
    Item: { id, title, description, handles, tweet }
  }, (error, data) => {
    if (error) {
      console.log(err, err.stack);
      callback(error);
    } else {
      console.log(`successfully created item: ${id.S}`);
      callback(null, {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
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
    TableName: process.env.sheetsTableName,
    Key: {
      id: { S: id }
    }
  }, (err, data) => {
    if (err) {
      console.log(err, err.stack);
      callback(err);
    } else {
      console.log(`successfully retrieved item: ${id}`);

      const sheet = {};
      sheet.id = data.Item.id.S;
      sheet.title = (data.Item.title) ? data.Item.title.S : '';
      sheet.description = (data.Item.description) ? data.Item.description.S : '';
      sheet.handles = data.Item.handles.L.map(item =>  item.S);
      sheet.tweet = data.Item.tweet.S;

      callback(null, {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify(sheet)
      });
    }
  });

};

module.exports.downloadCsv = (event, context, callback) => {
  const id = event.queryStringParameters.id;
  dynamodb.getItem({
    TableName: process.env.sheetsTableName,
    Key: {
      id: { S: id }
    }
  }, (err, data) => {
    if (err) {
      console.log(err, err.stack);
      callback(err);
    } else {
      console.log(`successfully retrieved item: ${id}`);

      const sheet = {};
      sheet.id = data.Item.id.S;
      sheet.handles = data.Item.handles.L.map(item =>  item.S);
      sheet.tweet = data.Item.tweet.S;

      // encode to csv
      const rows = [];
      rows.push([
        'handle',
        'tweet',
        'link'
      ]);
      sheet.handles.forEach(handle => {
        const columns = [];
        columns.push(handle);
        const tweet = sheet.tweet.replace(new RegExp('@handle', 'g'), handle);
        columns.push(tweet);
        const tweetEncoded = encodeURIComponent(tweet);
        const tweetHref = `https://twitter.com/intent/tweet?text=${tweetEncoded}`;
        columns.push(`=hyperlink("${tweetHref}", "Tweet!")`);
        rows.push(columns);
      });
      csv(rows, { quoted: true }, (err, output) => {
        if (err) callback(err);
        else {
          callback(null, {
            statusCode: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
              'Content-Type': 'text/csv',
              'Content-Disposition': 'attachment; filename="tweetsheet.csv"'
            },
            body: output
          });
        }
      });
    }
  });
};
