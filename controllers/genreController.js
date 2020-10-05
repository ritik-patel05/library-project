let Genre = require('../models/genre');
let Book = require('../models/book');
let validator = require('express-validator')

// Display list of all Genre.
exports.genre_list = async (req, res, next) => {
    
    await Genre.find()
        .sort([['name', 'ascending']])
        .exec()
        .then( list_genres => res.render('genre_list', { title: 'Genre List', genre_list: list_genres } ) )
        .catch( err => next(err) )
        
};

// Display detail page for a specific Genre.
exports.genre_detail = async (req, res) => {
    result = {
        genre: await Genre.findById(req.params.id).exec(),
        genre_books: await Book.find({ 'genre': req.params.id }).exec()
    }
    if (result.genre == null) { // No results.
        let err = new Error('Genre not found');
        err.status = 404;
        return next(err);
    }
    res.render('genre_detail', { title: 'Genre Detail', genre: result.genre, genre_books: result.genre_books });
};

// Display Genre create form on GET.
exports.genre_create_get = function(req, res) {
    res.render('genre_form', {title: 'Create Genre'})
};

// Handle Genre create on POST.
exports.genre_create_post = [

    // Validate the name field is not empty.
    //  calling trim() to remove any trailing/leading whitespace before performing the validation).
    validator.body('name', 'Genre name required').trim().isLength({ min: 1 }),

    // Sanitize(escape) the name field.  escape() any dangerous  HTML characters in the name field.
    validator.body('name').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a genre object with escaped and trimmed data.
        let genre = new Genre(
            { name: req.body.name }
        );

        // check whether there are any errors in the validation result.
        if(!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages. array of error messages (errors.array()).
            res.render('genre_form', { title: 'Create Genre', genre: genre, errors: errors.array() } );
            return;
        } else {
            // Data from form is valid.
            // Check if Genre with same name already exists.
            Genre.findOne({ 'name': req.body.name})
                .exec()
                .then( (found_genre) => {

                    if(found_genre) {
                        // Genre exists, redirect to its detail page.
                        res.redirect(found_genre.url);
                    } else {

                        genre.save()
                        .then(() => {
                            // Genre saved. Redirect to genre detail page.
                            res.redirect(genre.url)
                        })
                        .catch( err => next(err) )
                    }
                })
                .catch( err => next(err) )
        }
    }
];

// Display Genre delete form on GET.
exports.genre_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre delete GET');
};

// Handle Genre delete on POST.
exports.genre_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre delete POST');
};

// Display Genre update form on GET.
exports.genre_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre update GET');
};

// Handle Genre update on POST.
exports.genre_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre update POST');
};