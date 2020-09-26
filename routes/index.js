let express = require('express'); // Imports the express application Object.
let router = express.Router(); // Uses it to get a Router object.

/* GET home page. */ // Add a route to it using the get() method
// The first argument to this method is the URL path while the second is a callback function that will be invoked if an HTTP GET request with the path is received

// The callback takes three arguments (usually named as shown: req, res, next), that will contain the HTTP Request object, HTTP response, and the next function in the middleware chain.
router.get('/', (req, res, next) => {
  // res.render('index', { title: 'Express'  });
  res.redirect('/catalog');
});

// NOTE::: 
//Router functions are Express middleware, which means that they must either complete (respond to) the request or call the next function in the chain. In the case above we complete the request using render(), so the next argument is not used (and we choose not to specify it).

module.exports = router;

// Route Parametrs: What are they?

// Route parameters are named URL segments used to capture values at specific positions in the URL. The named segments are prefixed with a colon and then the name (e.g. /:your_parameter_name/. The captured values are stored in the req.params object using the parameter names as keys (e.g. req.params.your_parameter_name).

// So for example, consider a URL encoded to contain information about users and books: http://localhost:3000/users/34/books/8989. We can extract this information as shown below, with the userId and bookId path parameters:

/* app.get('/users/:userId/books/:bookId', function (req, res) {
   // Access userId via: req.params.userId
   // Access bookId via: req.params.bookId
   res.send(req.params);
 })
*/

