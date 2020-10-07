let Book = require('../models/book');
let Author = require('../models/author');
let Genre = require('../models/genre');
let BookInstance = require('../models/bookinstance');
// const validator = require('express-validator');
const { check, body, validationResult } = require('express-validator');


exports.index = async function (req, res) {
    
    results = {
        book_count: await Book.countDocuments({}).exec(), // Pass an empty object as match condition to find all documents of this collection.
        book_instance_count: await BookInstance.countDocuments({}).exec(),
        book_instance_available_count: await BookInstance.countDocuments({status:'Available'}).exec(),  
        author_count: await Author.countDocuments({}).exec(), 
        genre_count: await Genre.countDocuments({}).exec(),  
    };

    res.render('index', { title: 'LibX Library Home', data: results });
    
};

// Display list of all books.
exports.book_list = async function(req, res, next) {
    
    await Book.find({}, 'title author')
        .populate('author')
        .exec()
        .then( list_books => res.render('book_list', {title: 'Book List', book_list: list_books} ) )
        .catch( err => next(err) )
};

// Display detail page for a specific book.
exports.book_detail = async (req, res) => {
    
    result = {
        book: await Book.findById(req.params.id).populate('author').populate('genre').exec(),
        book_instance: await BookInstance.find({ 'book': req.params.id }).exec(),
    }

    if(result.book == null) {
        let err = new Error('Book Not Found');
        err.status = 404;
        return next(err);
    }
    // Successful, so render.
    res.render('book_detail', { title: result.book.title, book: result.book, book_instances: result.book_instance });
};

// Display book create form on GET.
exports.book_create_get = async (req, res, next) => {
    
    // Get all athors and genres, which we can use for adding to our book.
    results = {
        authors: await Author.find().exec() ,
        genres: await Genre.find().exec()
    }

    res.render('book_form', {title: 'Create Book', authors: results.authors, genres: results.authors });   
};

// Handle book create on POST.
exports.book_create_post = [

    // Convert the genre to an array.
    (req, res, next) => {
        if( !(req.body.genre instanceof Array) ) {
            if( typeof req.body.genre === 'undefined' ) {
                req.body.genre = [];
            } else {
                req.body.genre = Array.from(req.body.genre);
            }
        }
        // Call the next middlewares,
        next();
    } ,

    // Validate fields.
    check('title', 'Title must not be empty.').trim().isLength({ min: 1 }),
    check('author', 'Author must not be empty.').trim().isLength({ min: 1}),
    check('summary', 'Summary must not be empty.').trim().isLength({ min: 1}),
    check('isbn', 'ISBN must not be empty.').trim().isLength({ min: 1}),

    // Sanitize fields(using wildcard).
    body('*').escape(),
    body('genre.*').escape(), // Sanitizes the array of genre in req.body we made above.

    // Process request after validation and sanitization.
    async (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Book object with escaped and trimmed data.
        let book = new Book(
            {
                title: req.body.title,
                author: req.body.author,
                summary: req.body.summary,
                isbn: req.body.isbn,
                genre: req.body.genre
            });
        
        if(!errors.isEmpty()) {
            // There are errors Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            results = {
                authors: await Author.find().exec(),
                genres: await Genre.find().exec()
            }

            // Mark our selected genres as checked.
            for(let i = 0; i < results.genres.length; ++i) {
                if(book.genre.indexOf(results.genres[i]._id) > -1) {
                    // Current genre is selected. Set "checked" flag.
                    results.genres[i].checked = 'true';
                }
            }

            res.render('book_form', { title: 'Create Book', authors: results.authors, genres: results.genres, book: book, errors: errors.array() });
        } else {
            // Data from form is valid. Save book.
            book.save()
                .then( () => res.redirect(book.url) )
                .catch( err => next(err) );
        }

    }

]

// Display book delete form on GET.
exports.book_delete_get = async (req, res) => {
    
    results = {
        book: await Book.findById(req.params.id)
                        .populate('author').populate('genre').exec(),
        book_bookinstances: await BookInstance.find({ 'book': req.params.id }).exec()
    }

    // No results.
    if(results.book == null) {
        res.redirect('/catalog/books');
    }

    res.render('book_delete', { title: 'Delete Book', book: results.book, book_instances: results.book_bookinstances });
};

// Handle book delete on POST.
exports.book_delete_post = async (req, res, next) => {
    
    // Assume the post has valid id (ie no validation/sanitization).
    results = {
        book: Book.findById(req.body.id).populate('author').populate('genre').exec(),
        book_bookinstances: BookInstance.find({ 'book': req.body.id }).exec()
    }

    //Handle Error

    //Success.
    if (results.book_bookinstances.length > 0) {
        // Book has book_instance. Render in same ay as for GET route.
        res.render('book_delete', { title: 'Delete Book', book: results.book, book_instances: results.book_bookinstances });
        return;
    } else {
        // Book has no BookInstance objects. Delete object and redirect to the list of books.
        Book.findByIdAndDelete(req.body.id).exec()
            .then( () => red.redirect('/catalog/books'))
            .catch( err => next(err) );
    }

};

// Display book update form on GET.
exports.book_update_get = async (req, res, next) => {
    
    // Get book, authors and genres for form.
    results = {
        book: await Book.findById(req.params.id)
                        .populate('author').populate('genre').exec(),
        authors: await Author.find(),
        genres: await Genre.find()
    }

    // No results
    if(results.book == null) {
        let err = new Error('Book not found.');
        err.status = 404;
        return next(err);
    }
    // Success.
    // Mark our selected genres as checkd.
    for (let all_genre_id in results.genres) {
        for (let book_genre_id in results.book.genre ) {
            if( results.genres[all_genre_id]._id.toString() == results.book.genre[book_genre_id]._id.toString() ) {
                results.genres[all_genre_id].checked='true';
            }
        }
    }

    res.render('book_form', { title: 'Update Book', authors: results.authors, book: results.book, genres: results.genres });
};

// Handle book update on POST.
exports.book_update_post = [

    // Convert the genre to an array.
    (req, res, next) => {
        if( !(req.body.genre instanceof Array) ) {
            if( typeof req.body.genre === 'undefined' ) {
                req.body.genre = [];
            } else {
                req.body.genre = Array.from(req.body.genre);
            }
        }
        next();
    },

    // Validate fields.
    check('title', 'Title must not be empty.').trim().isLength({ min: 1 }),
    check('author', 'Author must not be empty.').trim().isLength({ min: 1 }),
    check('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }),
    check('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }),

    // Sanitize fields.
    body('title').escape(),
    body('author').escape(),
    body('summary').escape(),
    body('isbn').escape(),
    body('genre.*').escape(),

    // Precess request after validation and sanitization.
    async (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Book object with escapes/trimmed data and ol id.
        let book = new Book(
            {
                title: req.body.title,
                author: req.body.author,
                summary: req.body.summary,
                isbn: req.body.isbn,
                genre: (typeof req.body.genre === 'undefined') ? [] : req.body.genre,
                _id: req.params.id  //This is required, or a new ID will be assigned!
            });
        
        if(!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            results = {
                authors: await Author.find().exec(),
                genres: await Genre.find().exec()
            }

            // Mark our selected genres as checked.
            for (i in results.genres) {
                if (book.genre.indexOf(results.genres[i]._id) > -1) {
                    results.genres[i].checked = 'true';
                }
            }

            res.render('book_form', { title: 'Update Book', authors: results.authors, genres: results.genres, book: book, errors: errors.array() });

            return;
        } else {
            // Data form is valid. Update the record.
            await Book.findByIdAndUpdate(req.params.id, book).exec()
                        .then( (theBook) => res.redirect(theBook.url) )
                        .catch( err => next(err) )
        }
    }

]