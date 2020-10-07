1. What is Middleware? It is those methods/functions/operations that are called BETWEEN processing the Request and sending the Response in your application method.

2. When talking about express.json() and express.urlencoded() think specifically about POST requests (i.e. the .post request object) and PUT Requests (i.e. the .put request object)

3. You DO NOT NEED express.json() and express.urlencoded() for GET Requests or DELETE Requests.

4. You NEED express.json() and express.urlencoded() for POST and PUT requests, because in both these requests you are sending data (in the form of some data object) to the server and you are asking the server to accept or store that data (object), which is enclosed in the body (i.e. req.body) of that (POST or PUT) Request

5. Express provides you with middleware to deal with the (incoming) data (object) in the body of the request.

6. a. express.json() is a method inbuilt in express to recognize the incoming Request Object as a JSON Object. This method is called as a middleware in your application using the code: app.use(express.json());

   b. express.urlencoded() is a method inbuilt in express to recognize the incoming Request Object as strings or arrays. This method is called as a middleware in your application using the code: app.use(express.urlencoded());
