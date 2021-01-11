# Serverless-Spoon


Serverless Spoon is a meal-planning site written with a React.js frontend, and an AWS [Serverless Application Model](https://aws.amazon.com/serverless/sam/) backend. 

Its current features are: 

- Setting and tracking macronutrient goals. 
- Managing grocery inventory.
- Recipe planning and search using the [Sponnacular's API](https://spoonacular.com/food-api).



The full list of API endpoints is available in [SAM-backend/ENDPOINTS.md](https://github.com/Ekhemlin/Serverless-Spoon/blob/main/SAM-backend/ENDPOINTS.md)

## Getting Started

### Requirements: 

To build and deploy the project, you need to have:

- An AWS account. 
- The AWS CLI [installed](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv1.html) and [configured](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html). 
- The [SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html) installed.
- [npm](https://www.npmjs.com/) installed. 

### Setup instructions: 


- Clone the repository.  
- `cd serverlessSpoon/SAM-backend`
- Run `sam build && sam deploy`.
- Inside your AWS management console, go to the API Gateway page and ensure you have an API group named `sam-app`.
- Copy the value of the `ID` field for sam-app. 
- `cd ../frontend`
- Create a `.env` file in `serverlessSpoon/frontend ` with the variable `API_ENDPOINT=<sam-app ID>`.
- Run `npm install`.
- Run `npm start`.
