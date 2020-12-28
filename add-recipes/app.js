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
      body: errorMessage
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
    const getRecipesData = await documentClient.get(getRecipes).promise();
    if(!getRecipesData.hasOwnProperty(["Item"])){
      var response = {
        statusCode: 509,
        body: `user \'${body["id"]}\' not found`
      };
      return response;
    }
    var recipesList = Object.values(getRecipesData["Item"]["recipes"]);
    console.log(recipesList);
    var toAdd = body["recipeIds"];
    console.log(toAdd);
    for (var i = 0; i < toAdd.length; i++) {
      var recipe = toAdd[i];
      if (recipesList.includes(recipe)) {
        continue;
      }
      else {
        recipesList.push(recipe);
      }
    }
    updateRecipes = getRecipes;
    updateRecipes['UpdateExpression'] = "SET recipes = :array";
    updateRecipes['ExpressionAttributeValues'] = {
      ':array': recipesList,
    };
    const update = await documentClient.update(updateRecipes).promise();

    var response = {
      body: JSON.stringify({ "savedRecipes": recipesList }),
      statusCode: 200
    };
    return response; // Returning a 200 if the item has been inserted
  }
  catch (e) {
    let response = {
      statusCode: 500,
      body: JSON.stringify(e)
    };
    return response;
  }

};


