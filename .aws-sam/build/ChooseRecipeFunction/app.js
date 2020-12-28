// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
const AWS = require('aws-sdk');
const https = require('https');
const querystring = require('querystring');

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
  const recipeId = body["recipeId"];

  let dataString = '';
  const APIresponse = await new Promise((resolve, reject) => {
    var url = `https://api.spoonacular.com/recipes/${recipeId}/information?` + querystring.stringify({
      "apiKey": "d41161c9f9e8416cb1f41f655ea69192",
      "includeNutrition" : true
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

  recipeJSON = APIresponse.body;
  var ingridients = recipeJSON.extendedIngredients.map(a => a["name"]);
  var nutrients = recipeJSON["nutrition"]["nutrients"];

  var cal;
  var fat;
  var protein;
  var carbs;
  nutrients.forEach(x => { 
    if(x.title=="Calories"){
        cal = x.amount;}
    if(x.title=="Fat"){
        fat = x.amount;}
    if(x.title=="Protein"){
        protein = x.amount;}
    if(x.title=="Net Carbohydrates"){
        carbs = x.amount;}
  });

  var nutrientsResponse = {"calories" : cal, "fat" : fat, "carbs" : carbs, "protein" :protein};


  const documentClient = new AWS.DynamoDB.DocumentClient();

  var userParams = {
    TableName: 'Users',
    Key: {
      "id": body['id']
    },
    ProjectionExpression: "macros,inventory"
  };

  try {
    const userData = await documentClient.get(userParams).promise();
    var macros = userData["Item"]["macros"];
    var today = new Date();
    var lastDate = new Date(macros["date"]);
    if (!(datesAreOnSameDay(today, lastDate))) {
      macros["calories"] = "0";
      macros["fat"] = "0";
      macros["protein"] = "0";
      macros["carbs"] = "0";
      macros["date"] = today;
    }
   var items = userData["Item"]["inventory"];

    newMacros = {
      "calories" : (parseInt(macros["calories"]) + cal),
      "fat" : (parseInt(macros["fat"]) + fat),
      "protein" : (parseInt(macros["protein"]) + protein),
      "carbs" : (parseInt(macros["carbs"]) + carbs),
      "date" : macros["date"]
    }

    let missingInventoryItems = ingridients.filter(x => !items.includes(x));  
    var updateMacros = userParams;
    updateMacros['UpdateExpression'] = "SET macros = :newMacros";
    updateMacros['ExpressionAttributeValues'] = {
      ':newMacros': newMacros,
    };
    const update = await documentClient.update(updateMacros).promise();

    var response = {
      body: JSON.stringify({ "ingridients": ingridients, "nutrition" : nutrientsResponse, "missingIngridients" : missingInventoryItems, "instructions" : recipeJSON["instructions"], "analyzedInstructions" : recipeJSON["analyzedInstructions"]}),
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


