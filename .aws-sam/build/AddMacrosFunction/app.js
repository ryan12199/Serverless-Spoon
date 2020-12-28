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
const datesAreOnSameDay = (first, second) =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate();

exports.lambdaHandler = async (event, context) => {
  let body = JSON.parse(event.body);
  const documentClient = new AWS.DynamoDB.DocumentClient();

  var getMacros = {
    TableName: 'Users',
    Key: {
      "id": body['id']
    },
    ProjectionExpression: "macros"
  };

  try {
    const getMacrosData = await documentClient.get(getMacros).promise();
    var macros = getMacrosData["Item"]["macros"];
    var today = new Date();
    var lastDate = new Date(macros["date"]);
    var newMacros;
    if (datesAreOnSameDay(today, lastDate)) {

      newCal = parseInt(macros["calories"]) + parseInt(body["calories"]);
      newProt = parseInt(macros["protein"]) + parseInt(body["protein"]);
      newFat = parseInt(macros["fat"]) + parseInt(body["fat"]);
      newCarbs = parseInt(macros["carbs"]) + parseInt(body["carbs"]);

      newMacros = {
        "calories": newCal,
        "protein": newProt,
        "fat": newFat,
        "carbs": newCarbs,
        "date": lastDate
      }
    }
    else {
      newMacros = {
        "calories": parseInt(body["calories"]),
        "protein": parseInt(body["protein"]),
        "fat": parseInt(body["fat"]),
        "carbs": parseInt(body["carbs"]),
        "date": new Date().toJSON()
      }
    }
    var updateMacros = getMacros;
    updateMacros['UpdateExpression'] = "SET macros = :newMacros";
    updateMacros['ExpressionAttributeValues'] = {
      ':newMacros': newMacros,
    };
    const update = await documentClient.update(updateMacros).promise();

    var response = {
      body: JSON.stringify({ "macros": newMacros }),
      statusCode: 200
    };
    return response;
  }
  catch (e) {
    let response = {
      statusCode: 500,
      body: JSON.stringify(e)
    };
    return response;
  }
};


