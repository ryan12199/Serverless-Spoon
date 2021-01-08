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
const datesAreOnSameDay = (first, second) =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate();

exports.lambdaHandler = async (event, context) => {
  let body = JSON.parse(event.body);

  const CORS = {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
  };

  var errorMessage = null;
  // if (!body.hasOwnProperty("calories")) { errorMessage = "Parameter \'calories\' is missing in the request body" }
  // if (!body.hasOwnProperty("fat")) { errorMessage = "Parameter \'fat\' is missing in the request body" }
  // if (!body.hasOwnProperty("protein")) { errorMessage = "Parameter \'protein\' is missing in the request body" }
  // if (!body.hasOwnProperty("carbs")) { errorMessage = "Parameter \'carbs\' is missing in the request body" }
  if (!body.hasOwnProperty("id")) { errorMessage = "Parameter \'id\' is missing in the request body" }
  if (errorMessage) {
    var response = {
      statusCode: 509,
      body: errorMessage,
      headers: CORS
    };
    return response;
  }

  const documentClient = new AWS.DynamoDB.DocumentClient();
  var getMacroGoals = {
    TableName: 'Users',
    Key: {
      "id": body['id']
    },
    ProjectionExpression: "macroGoals"
  };

  try {
    const getMacroGoalData = await documentClient.get(getMacroGoals).promise();
    if (!getMacroGoalData.hasOwnProperty(["Item"])) {
      var response = {
        statusCode: 509,
        body: `user \'${body["id"]}\' not found`,
        headers: CORS
      };
      return response;
    }
    var macroGoals = getMacroGoalData["Item"]["macroGoals"];
    if(body.hasOwnProperty("calories")){
      macroGoals["calories"] = body.calories;
    }
    if(body.hasOwnProperty("carbs")){
      macroGoals["carbs"] = body.carbs;
    }
    if(body.hasOwnProperty("fat")){
      macroGoals["fat"] = body.fat;
    }
    if(body.hasOwnProperty("protein")){
      macroGoals["protein"] = body.protein;
    }

    var updateMacroGoals = getMacroGoals;
    updateMacroGoals['UpdateExpression'] = "SET macroGoals = :newMacrosGoals";
    updateMacroGoals['ExpressionAttributeValues'] = {
      ':newMacrosGoals': macroGoals,
    };
    const update = await documentClient.update(updateMacroGoals).promise();

    var response = {
      body: JSON.stringify({ "macroGoals": macroGoals }),
      statusCode: 200,
      headers: CORS
    };
    return response;
  }
  catch (e) {
    let response = {
      statusCode: 500,
      body: JSON.stringify(e),
      headers: CORS
    };
    return response;
  }
};


