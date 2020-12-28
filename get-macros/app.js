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

  const documentClient = new AWS.DynamoDB.DocumentClient();

  var getMacros = {
    TableName: 'Users',
    Key: {
      "id": event['queryStringParameters']['id']
    },
    ProjectionExpression: "macros"
  };

  try {
    const getMacrosData = await documentClient.get(getMacros).promise();
    if(!getMacrosData.hasOwnProperty(["Item"])){
      var response = {
        statusCode: 509,
        body: `user \'${body["id"]}\' not found`
      };
      return response;
    }
    var macros = getMacrosData["Item"]["macros"];
    var today = new Date(); 
    var lastDate = new Date(macros["date"]);
   
    
    if(datesAreOnSameDay(today, lastDate)){
      var response = {
        body: JSON.stringify({"macros" : macros}),
        statusCode: 200
      };
      return response; 
    }
    else{
    var newMacros = {
      "calories": 0,
      "protein": 0,
      "fat": 0,
      "carbs": 0,
      "date": today.toJSON()
    };

    var updateMacros = getMacros;
    updateMacros['UpdateExpression'] = "SET macros = :newMacros";
    updateMacros['ExpressionAttributeValues'] = {
      ':newMacros': newMacros,
    };
    const update = await documentClient.update(updateMacros).promise();

    var response = {
      body: JSON.stringify({"macros" : newMacros}),
      statusCode: 200
    };
    return response; 



    }

    
  }
  catch (e) {
    let response = {
      statusCode: 500,
      body: JSON.stringify(e)
    };
    return response;
  }

};


