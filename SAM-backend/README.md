# Serverless-Spoon Backend


Serverless backend for a meal-planning site written using AWS's [Serverless Application Model](https://aws.amazon.com/serverless/sam/). 

So far, the backend supports grocery inventory management, macro tracking, and recipe planning using [Sponnacular's API](https://spoonacular.com/food-api). The full list of  endpoints is available in ENDPOINTS.md

## Getting Started

### Requirements: 

To build and deploy the backend, you need to have:

- An AWS account. 
- The AWS CLI [installed](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv1.html) and [configured](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html). 
- The [SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html) installed.

### Setup instructions: 


- Clone the repository.  
- `cd serverlessSpoon/SAM-backend`
- Run `sam build && sam deploy`.
- Inside your AWS management console, go to the API Gateway page and ensure you have an API group named `sam-app`.

