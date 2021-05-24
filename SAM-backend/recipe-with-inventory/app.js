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
  if (!body.hasOwnProperty("id")) {
    errorMessage = "Parameter \'id\' is missing in the request body";
  }
  if (errorMessage) {
    var response = {
      statusCode: 509,
      headers : CORS,
      body: errorMessage
    };
    return response;
  }




  const documentClient = new AWS.DynamoDB.DocumentClient();

  var params = {
    TableName: 'Users',
    Key: {
      "id": body["id"]
    }
  };
  try {
    // Utilising the put method to insert an item into the table (https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GettingStarted.NodeJs.03.html#GettingStarted.NodeJs.03.01)
    const getInventoryData = await documentClient.get(params).promise();
    if(!getInventoryData.hasOwnProperty(["Item"])){
      var response = {
        headers : CORS,
        statusCode: 509,
        body: `user \'${body["id"]}\' not found`
      };
      return response;
    }
    
    
    var inventoryRecipesUpdateTime = getInventoryData["Item"]["inventoryRecipes"]["lastUpdateTime"];
    var inventoryUpdateTime = getInventoryData["Item"]["inventoryLastUpdatedTime"];
    if(inventoryRecipesUpdateTime>inventoryUpdateTime){
      const returnList = getInventoryData["Item"]["inventoryRecipes"]["recipeList"];
      return {
        statusCode: 200,
        headers : CORS,
        body: JSON.stringify({"recipes" : returnList, "cached" : true})
      };
    }
    
  
    
    var inventory = Object.values(getInventoryData["Item"]["inventory"]);
    
    

    let dataString = '';
    response = await new Promise((resolve, reject) => {
      var url = "https://api.spoonacular.com/recipes/findByIngredients?" + querystring.stringify({
        "apiKey": "d41161c9f9e8416cb1f41f655ea69192",
        "ingredients": inventory
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

  
    var date = new Date();
    var dateStr = String(date.getTime());  

  
    params['UpdateExpression'] = "SET inventoryRecipes.recipeList = :inventoryRecipes, inventoryRecipes.lastUpdateTime = :time";
    params['ExpressionAttributeValues'] = {
      ':inventoryRecipes': dataString,
      ':time' : dateStr
    }
    const update = await documentClient.update(params).promise();


    return {
      statusCode: 200,
      headers : CORS,
      body: JSON.stringify({"recipes" : dataString, "cached" : false})
    };;


    // Returning a 200 if the item has been inserted 
  } catch (e) {
    console.log(e);
    return {
      statusCode: 500,
      headers : CORS,
      body: JSON.stringify(e)
    };
  }

};

