// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
const AWS = require('aws-sdk');
let response;

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */
exports.lambdaHandler = async (event, context) => {

  const CORS = {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
  };
  const documentClient = new AWS.DynamoDB.DocumentClient();
  const userId = event['queryStringParameters']['id']; 

  var getInventory = {
    TableName: 'Users',
    Key: {
      "id": userId
    },
    ProjectionExpression: "inventory"
  };

  try {
    const getInventoryData = await documentClient.get(getInventory).promise();
    if(!getInventoryData.hasOwnProperty(["Item"])){
      var response = {
        headers : CORS,
        statusCode: 509,
        body: `user \'${userId}\' not found`
      };
      return response;
    }

    var inventory = Object.values(getInventoryData["Item"]["inventory"]);
    var response = {
      headers : CORS,
      body: JSON.stringify({ "inventory": inventory }),
      statusCode: 200
    };
    return response; // Returning a 200 if the item has been inserted
  }
  catch (e) {
    let response = {
      headers : CORS,
      statusCode: 500,
      body: JSON.stringify(e)
    };
    return response;
  }
};


