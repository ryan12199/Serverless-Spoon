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
exports.lambdaHandler = async (event, context) => {
  let body = JSON.parse(event.body);

  let dataString = '';

  const response = await new Promise((resolve, reject) => {
    var url = "https://api.spoonacular.com/recipes/complexSearch?" + querystring.stringify({
      "apiKey": "d41161c9f9e8416cb1f41f655ea69192",
      "query": body["query"],
      "cuisine": body["cuisine"],
      "excludeCuisine": body['excludeCuisine'],
      "diet": body["diet"]
    });
    console.log(url);
    const req = https.get(url, function (res) {
      res.on('data', chunk => {
        dataString += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: 200,
          body: dataString
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

  return response;
};

