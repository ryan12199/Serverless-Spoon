// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
const AWS = require('aws-sdk');
const https = require('https');
const querystring = require('querystring');

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
  var dataString = "";
  const documentClient = new AWS.DynamoDB.DocumentClient();
  const userId = event['queryStringParameters']['id']; 

  var getRecipes = {
    TableName: 'Users',
    Key: {
      "id": userId
    },
    ProjectionExpression: "savedRecipeIds,cachedRecipes"
  };

  try {
    const getRecipesData = await documentClient.get(getRecipes).promise();
    if(!getRecipesData.hasOwnProperty(["Item"])){
      var response = {
        statusCode: 509,
        headers : CORS,
        body: `user \'${userId}\' not found`
      };
      return response;
    }
    var cachedRecipeIds = Object.values(getRecipesData["Item"]["savedRecipeIds"]);
    var cachedRecipes = Object.values(getRecipesData["Item"]["cachedRecipes"]);
    var responseList = [];
    if(cachedRecipeIds.length==cachedRecipes.length){
      responseList = cachedRecipes;
    }
    else{
      var i; 
      for(i=0; i<cachedRecipes.length; i++){
        recipe = cachedRecipes[i];
        if(cachedRecipeIds.includes(recipe.id)){
          responseList.push(recipe);
        }
      }
    }
    return {
      statusCode: 200,
      headers : CORS,
      body: JSON.stringify({"savedRecipes" : responseList})
    };
  }
  catch (e) {
    return {
      statusCode: 500,
      headers : CORS,
      body: JSON.stringify(e)
    }
  }
};