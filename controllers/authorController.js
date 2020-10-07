let Author = require('../models/author');
let Book = require('../models/book');
const { check, body, validationResult } = require('express-validator');

// Display list of all Authors.
exports.author_list = async (req, res, next) => {
    
    await Author.find()
        .sort([['family_name', 'ascending']])
        .exec()
        .then( list_authors => res.render('author_list', { title: 'Author List', author_list: list_authors } ) )
        .catch( err => next(err) )

};

// Display detail page for a specific Author.
exports.author_detail = async (req, res) => {
    result = {
        author: await Author.findById(req.params.id).exec(),
        authors_books: await Book.find({ 'author': req.params.id }, 'title summary').exec()
    }

    if(result.author == null) {
        let err = new Error('Author not found');
        err.status = 404;
        return next(err);
    }
    // Successful, so render.
    res.render('author_detail', { title: 'Author Detail', author: result.author, author_books: result.authors_books });
};

// Display Author create form on GET.
exports.author_create_get = function(req, res) {
    res.render('author_form', { title: 'Create Author '} );
};

// Handle Author create on POST.
exports.author_create_post = [

    // Validate fields.
    check('first_name').
        isLength({ min: 1} ).trim().withMessage('First Name must be specified.')
        .isAlphanumeric().withMessage('First Name has non-alphanumeric characters.') ,
    check('family_name')
        .isLength({ min: 1} ).trim().withMessage('Family Name must be specified.')
        .isAlphanumeric().withMessage('Family Name has non-alphanumeric characters.') ,
    // We can use the optional() function to run a subsequent validation only if a field has been entered (this allows us to validate optional fields).
    // Adds a validator to check for the existence of the current fields in the request. This means the value of the fields may not be undefined; all other values are acceptable.

    // You can customize this behavior by passing an object with the following options:

    // checkNull: if true, fields with null values will not exist
    // checkFalsy: if true, fields with falsy values (eg "", 0, false, null) will also not exist
    check('date_of_birth', 'Invalid date of birth' )
        .optional({ checkFalsy: true }).isISO8601() ,
    check('date_of_death', 'Invalid date of death')
        .optional({ checkFalsy: true }).isISO8601(),


    // Sanitize fields.
    body('first_name').escape(),
    body('family_name').escape(),
    body('date_of_birth').toDate(),
    body('date_of_death').toDate(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if(!errors.isEmpty()) {
            // There are errors. Render form again wwith sanitized values/errors messages.
            res.render('author_form', { title: 'Create Author', author: req.body, errors: errors.array() });
            return;
        } else {
            // Data from form is valid.

            // Unlike with the Genre post handler, we don't check whether the Author object already exists before saving it. Arguably we should, though as it is now we can have multiple authors with the same name.

            // Create an Author object with escpaed and trimmed data.
            let author = new Author(
                {
                    first_name: req.body.first_name,
                    family_name: req.body.family_name,
                    date_of_birth: req.body.date_of_birth,
                    date_of_death: req.body.date_of_death
                });
            
            author.save()
                .then( () => 
                    // Sccessful - redirect to new author record.
                    res.redirect(author.url)
                )
                .catch( err => next(err) )
        }
    }

]

// Display Author delete form on GET.
exports.author_delete_get = async (req, res, next) => {
    
    let results = {
        author: await Author.findById(req.params.id).exec(),
        authors_books: await Book.find({ 'author': req.params.id }).exec()
    }

    // If  findById() returns no results the author is not in the database. In this case there is nothing to delete, so we immediately render the list of all authors. 
    if(results.author == null) {
        res.redirect('/catalog/authors');
    }
    res.render('author_delete', { title: 'Delete Author', author: results.author, author_books: results.authors_books });
};

// Handle Author delete on POST.
exports.author_delete_post = async (req, res, next) => {
    
    // Assume the post has valid id (ie no validation/sanitization).
    
    results = {
        author: await Author.findById(req.body.authorid).exec(),
        authors_books: await Book.find({ 'author': req.body.authorid }).exec()
    }

    //Handle error.

    // Success.
    if( results.authors_books.length > 0) {
        // Author has books. Render in same way as for GET route.
        res.render('author_delete', { title: 'Delete Author', author: results.author, author_books: results.authors_boos });
        return;
    } else {
        // Author has no books. Delete object and redirect to the list of authors.
        console.log("here ", req.body.authorid);
        await Author.findByIdAndRemove(req.body.authorid)
            .then( () => res.redirect('/catalog/authors'))
            .catch( err => next(err) )
        console.log("finish");
    }
};

// Display Author update form on GET.
exports.author_update_get = async (req, res, next) => {
    
    await Author.findById(req.params.id).exec()
                .then( (author) => {
                    if(author == null) {
                        let err = new Error('Author not found.');
                        err.status = 404;
                        return next(err);
                    }
                    //Success.
                    res.render('author_form', { title: 'Upate Author', author: author });
                })
};

// Handle Author update on POST.
exports.author_update_post = [

    // Validate fields.
    // Validate fields.
    check('first_name').
        isLength({ min: 1} ).trim().withMessage('First Name must be specified.')
        .isAlphanumeric().withMessage('First Name has non-alphanumeric characters.') ,
    check('family_name')
        .isLength({ min: 1} ).trim().withMessage('Family Name must be specified.')
        .isAlphanumeric().withMessage('Family Name has non-alphanumeric characters.') ,
    check('date_of_birth', 'Invalid date of birth' )
        .optional({ checkFalsy: true }).isISO8601() ,
    check('date_of_death', 'Invalid date of death')
        .optional({ checkFalsy: true }).isISO8601(),

    // Sanitize fields.
    body('first_name').escape(),
    body('family_name').escape(),
    body('date_of_birth').toDate(),
    body('date_of_death').toDate(),

    // Process request after validation and sanitization.
    async (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create Author object with escaped and trimmed date (and the old id!)
        let author = new Author(
            {
                first_name: req.body.first_name,
                family_name: req.body.family_name,
                date_of_birth: req.body.date_of_birth,
                date_of_death: req.body.date_of_death,
                _id: req.params.id
            }
        );

        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values and error messages.
            res.render('author_form', { title: 'Update Author', author: author, errors: errors.array() });
            return;
        } else {
            // Data from form is valid. Update the record.
            await Author.findByIdAndUpdate(req.params.id, author).exec()
                        .then( theauthor => res.redirect(theauthor.url) )
                        .catch(  err => next(err) );
        }
    }
    
]