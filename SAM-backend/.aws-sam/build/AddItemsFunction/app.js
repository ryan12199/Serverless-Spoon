// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
const AWS = require('aws-sdk');

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

  let body = JSON.parse(event.body)
  const CORS = {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
  };

  const documentClient = new AWS.DynamoDB.DocumentClient();

  var getInventory = {
    TableName: 'Users',
    Key: {
      "id": body["id"]
    },
    ProjectionExpression: "inventory"
  };

  var errorMessage = null;
  if (!body.hasOwnProperty("items")) {
    errorMessage = "Parameter \'items\' is missing in the request body";
  }
  if (!body.hasOwnProperty("id")) {
    errorMessage = "Parameter \'id\' is missing in the request body";
  }
  if (errorMessage) {
    var response = {
      statusCode: 509,
      body: errorMessage,
      headers: CORS
    };
    return response;
  }
  try {
    const getInventoryData = await documentClient.get(getInventory).promise();
    if (!getInventoryData.hasOwnProperty(["Item"])) {
      var response = {
        statusCode: 509,
        body: `user \'${body["id"]}\' not found`,
        headers: CORS
      };
      return response;
    }

    var inventory = Object.values(getInventoryData["Item"]["inventory"]);


    var toAdd = body["items"];
    var item;
    for (var i = 0; i < toAdd.length; i++) {
      var item = toAdd[i].toLowerCase();
      if (inventory.includes(item)) {
        continue;
      }
      else {
        inventory.push(item);
      }
    }
    var updateInventory = getInventory;
    var date = new Date();
    var dateString = String(date.getTime());


    updateInventory['UpdateExpression'] = "SET inventory = :array, inventoryLastUpdatedTime = :time";
    updateInventory['ExpressionAttributeValues'] = {
      ':array': inventory,
      ':time' : dateString
    };

    const update = await documentClient.update(updateInventory).promise();

    var response = {
      body: JSON.stringify({ "inventory": inventory }),
      statusCode: 200,
      headers: CORS
    };
    return response; // Returning a 200 if the item has been inserted
  }
  catch (e) {
    response = {
      statusCode: 500,
      body: JSON.stringify(e),
      headers: CORS
    };
    return response;
  }
};