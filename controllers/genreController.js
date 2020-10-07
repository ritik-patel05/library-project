let Genre = require('../models/genre');
let Book = require('../models/book');
let validator = require('express-validator');
const { check, body, validationResult } = require('express-validator');

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
    check('name', 'Genre name required').trim().isLength({ min: 1 }),

    // Sanitize(escape) the name field.  escape() any dangerous  HTML characters in the name field.
    body('name').escape(),

    // Process request after validation and sanitization.
    async (req, res, next) => {

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
            await Genre.findOne({ 'name': req.body.name})
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
exports.genre_delete_get = async (req, res, next) => {
    
    results = {
        genre: await Genre.findById(req.params.id).exec(),
        genre_books: await Book.find({ 'genre': req.params.id }).exec()
    }

    if(results.genre == null) { // No results.
        res.redirect('/catalog/genres');
    }
    res.render('genre_delete', { title: 'Delete Genre', genre: results.genre, genre_books: results.genre_books });
};

// Handle Genre delete on POST.
exports.genre_delete_post = async (req, res, next) => {
    
    // Assuming valid fields, so no saitization and validation.
    results = {
        genre: await Genre.findById(req.params.id).exec(),
        genre_books: await Book.find({ 'genre': req.params.id }).exec()
    }

    if(results.genre_books.length > 0) {
        // Genre has books. Render in same way as for GET route.
        res.render('genre_delete', { title: 'Delete Genre', genre: results.genre, genre_books: results.genre_books });
        return;
    } else {
        // Genre has no books. Delete object and redirect to the list of genres.
        await Genre.findByIdAndRemove(req.body.id)
                    .exec()
                    .then(() => res.redirect('/catalog/genres') )
                    .catch( err => next(err) );
    }
};

// Display Genre update form on GET.
exports.genre_update_get = async (req, res, next) => {

    await Genre.findById(req.params.id)
                .exec()
                .then( (genre) => {
                    if(genre == null) {
                        let err = new Error('Genre not found.');
                        err.status = 404;
                        return next(err);
                    }
                    //Success.
                    res.render('genre_form', { title: 'Update Genre', genre: genre });
                })
                .catch( err => next(err));

};

// Handle Genre update on POST.
exports.genre_update_post = [

    // Valiate the name field.
    check('name', 'Genre name required.').isLength({ min: 1 }).trim(),

    // Sanitize the name field.
    body('name').escape(),

    // Process request after validation and sanitization.
    async (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a genre object with escaped and trimmed data( and the old id!)
        let genre = new Genre(
            {
                name: req.body.name,
                _id: req.params.id
            }
        );

        if(!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values and error messages.
            res.render('genre_form', { title: 'Update Genre', genre: genre, errors: errors.array() });
            return;
        } else {
            // Data from form is valid. Update the record.
            await Genre.findByIdAndUpdate(req.params.id, genre).exec()
                        .then( (theGenre) => res.redirect(theGenre.url) )
                        .catch( err => next(err));
        }
    }
]