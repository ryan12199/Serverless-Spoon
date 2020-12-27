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
exports.lambdaHandler = async (event, context) => {

  let body = JSON.parse(event.body)
  const documentClient = new AWS.DynamoDB.DocumentClient();


  var findUserParams = {
    TableName: 'Users',
    Key: {
      "id": body["id"]
    }
  };
  try {

    var macrosJSON = {
      "calories": 0,
      "protein": 0,
      "fat": 0,
      "carbs": 0,
      "date": new Date().toJSON()
    };
    // Utilising the put method to insert an item into the table (https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GettingStarted.NodeJs.03.html#GettingStarted.NodeJs.03.01)
    const findUserData = await documentClient.get(findUserParams).promise();
    if (Object.keys(findUserData).length === 0) {
      const insertUserParams = {
        TableName: "Users",
        Item: {
          id: body["id"],
          password: body["password"],
          recipes: [],
          inventory: [],
          macros : macrosJSON
        }
      };
      const insertUserData = await documentClient.put(insertUserParams).promise();
      console.log(insertUserData);
      var response;
      response = {
        body: body["id"],
        statusCode: 200
      };
      return response; // Returning a 200 if the item has been inserted 
    }
    else {
      console.log("user data : " + findUserData);
      response = {
        body: "Please choose a different username",
        statusCode: 500,
      };
      return response;
    }
  }
  catch (e) {
    response = {
      statusCode: 500,
      body: JSON.stringify(e)
    };
    return response;
  }
};

