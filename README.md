# Serverless Backend

## Available endpoints:

`POST /register`					
### Body parameters: 

`id` : username for the registered user
`password`: password of the registered user 

### Return values: 

Either the `id` of the user and `StatusCode : 200`, or `statusCode : 500` and an error message