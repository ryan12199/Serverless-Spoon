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

  let body = JSON.parse(event.body);
  const CORS = {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
  };
  var errorMessage = null;
  if (!body.hasOwnProperty("recipeIds")) {
    errorMessage = "Parameter \'recipeIds\' is missing in the request body";
  }
  if (!body.hasOwnProperty("id")) {
    errorMessage = "Parameter \'id\' is missing in the request body";
  }
  if (errorMessage) {
    var response = {
      statusCode: 509,
      body: errorMessage,
      headers : CORS
    };
    return response;
  }

  const documentClient = new AWS.DynamoDB.DocumentClient();
  var getRecipes = {
    TableName: 'Users',
    Key: {
      "id": body["id"]
    },
    ProjectionExpression: "recipes"
  };

  try {
    // Utilising the put method to insert an item into the table (https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GettingStarted.NodeJs.03.html#GettingStarted.NodeJs.03.01)
    const getRecipesData = await documentClient.get(getRecipes).promise();
    if(!getRecipesData.hasOwnProperty(["Item"])){
      var response = {
        statusCode: 509,
        headers : CORS,
        body: `user \'${body["id"]}\' not found`
      };
      return response;
    }
    var recipeList = Object.values(getRecipesData["Item"]["recipes"]);
    var toRemove = body["recipeIds"];
    var newRecipeList = [];
    for (var i = 0; i < recipeList.length; i++) {
      var recipe = recipeList[i];
      if (toRemove.includes(recipe)) {
        continue;
      }
      else {
        newRecipeList.push(recipe);
      }
    }
    updateRecipes = getRecipes;
    updateRecipes['UpdateExpression'] = "SET recipes = :array";
    updateRecipes['ExpressionAttributeValues'] = {
      ':array': newRecipeList,
    };
    const update = await documentClient.update(updateRecipes).promise();

    var response = {
      body: JSON.stringify({ "savedRecipes": newRecipeList }),
      statusCode: 200,
      headers : CORS
    };
    return response; // Returning a 200 if the item has been inserted
  }
  catch (e) {
    let response = {
      statusCode: 500,
      headers : CORS,
      body: JSON.stringify(e)
    };
    return response;
  }
};


