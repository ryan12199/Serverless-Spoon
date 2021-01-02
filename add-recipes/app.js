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
      headers: CORS
    };
    return response;
  }


  const documentClient = new AWS.DynamoDB.DocumentClient();
  var getRecipes = {
    TableName: 'Users',
    Key: {
      "id": body["id"]
    }
  };

  // try {
  const getRecipesData = await documentClient.get(getRecipes).promise();
  if (!getRecipesData.hasOwnProperty(["Item"])) {
    var response = {
      statusCode: 509,
      body: `user \'${body["id"]}\' not found`,
      headers: CORS
    };
    return response;
  }

  var savedRecipeList = []
  if (getRecipesData["Item"]["savedRecipeIds"].length) {
    savedRecipeList = Object.values(getRecipesData["Item"]["savedRecipeIds"]);
  }
  var toAdd = body["recipeIds"];
  for (var i = 0; i < toAdd.length; i++) {
    var recipe = toAdd[i];
    if (!savedRecipeList.includes(recipe)) {
      savedRecipeList.push(recipe);
    }
  }
  var dataString = "";
  const APIresponse = await new Promise((resolve, reject) => {
    var url = "https://api.spoonacular.com/recipes/informationBulk?" + querystring.stringify({
      "apiKey": "e7218a3fa6594b6b93628b514c105898",
      "ids": savedRecipeList.toString(),
      "includeNutrition": false
    });
    const req = https.get(url, function (res) {
      res.on('data', chunk => {
        dataString += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: 200,
          body: JSON.parse(dataString)
        });
      });
    });

    req.on('error', (e) => {
      reject({
        statusCode: 500,
        body: 'Something went wrong!'
      });
    });
  });

  var updateRecipes = getRecipes;
  updateRecipes['UpdateExpression'] = "SET cachedRecipes = :newRecipes, savedRecipeIds = :newRecipeIds";
  updateRecipes['ExpressionAttributeValues'] = {
    ':newRecipes': APIresponse["body"],
    ':newRecipeIds' : savedRecipeList
  };
  const update = await documentClient.update(updateRecipes).promise();
  var response = {
    body: JSON.stringify({ "savedRecipes": savedRecipeList }),
    statusCode: 200,
    headers: CORS
  };
  return response; // Returning a 200 if the item has been inserted
  // }
  // catch (e) {
  //   let response = {
  //     statusCode: 500,
  //     body: JSON.stringify(e),
  //     headers: CORS
  //   };
  //   return response;
  // }

};


6