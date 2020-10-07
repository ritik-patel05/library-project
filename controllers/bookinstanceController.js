let BookInstance = require('../models/bookinstance');
let Book = require('../models/book');
// let validator = require('express-validator');
const { check, body, validationResult } = require('express-validator');

// Display list of all BookInstances.
exports.bookinstance_list = async (req, res, next) => {
    
    await BookInstance.find()
        .populate('book')
        .exec()
        .then(list_bookinstances => res.render('bookinstance_list', { title: 'Book Instance List', bookinstance_list: list_bookinstances } ) )
        .catch(err => next(err) )
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = async (req, res, next) => {

    await BookInstance.findById(req.params.id)
                    .populate('book')
                    .exec()
                    .then((result) => {
                        if(result == null) {
                            let err = new Error('Book copy not found.');
                            err.status = 404;
                            return next(err);
                        }
                        res.render('bookinstance_detail', { title: 'Copy: '+result.book.title, bookinstance: result });
                    })
                    .catch(err => next(err))
};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = async (req, res, next) => {
    
    // console.log("before");
    await Book.find({}, 'title')
        .exec()
        .then( (books) => {
            // console.log(books, books.toString());
            res.render('bookinstance_form', { title: 'Create BookInstance', book_list: books}) }
        )
        .catch( err => next(err));

    // console.log("after");
    // The controller gets a list of all books (book_list) and passes it to the view bookinstance_form.pug (along with the title)
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
    

    // Validate fields.
    check('book', 'Book must be specified').trim().isLength({ min: 1 }) ,
    check('imprint', 'Imprint must be specified').trim().isLength({ min: 1 }) ,
    check('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601() ,

    // Sanitize fields
    body('book').trim().escape(),
    body('imprint').trim().escape(),
    body('status').trim().escape(),
    body('due_back').trim().toDate(),

    // Process request after validation and sanitization.
    async (req, res, next) => {
        
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a BookInstance object with escaped and trimmed data.
        let bookinstance = new BookInstance(
            {
                book: req.body.book,
                imprint: req.body.imprint,
                status: req.body.status,
                due_back: req.body.due_back
            });
            
            console.log("in here bookinstance ", bookinstance.book, bookinstance.book.toString());
            if(!errors.isEmpty()) {
                // There are errors. Render form again with sanitized values and error messages.
                await Book.find({}, 'title')
                    .exec()
                    .then( (books) => res.render('bookinstance_form', { title: 'Create BookInstance', book_list: books, selected_book: bookinstance.book._id , errors: errors.array() , bookinstance: bookinstance }) )
                    .catch( err => next(err) );
                
                return;
            } else {
                // Data from form is valid.
                bookinstance.save()
                    .then( () => res.redirect(bookinstance.url) );
            }
    }
]

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = async (req, res, next) => {

    await BookInstance.findById(req.params.id)
        .populate('book')
        .exec()
        .then( (bookinstance) => {
            if(bookinstance == null) { // No results.
                res.redirect('/catalog/bookinstances');
            }
            // Successful, so render.
            res.render('bookinstance_delete', { title: 'Delete BookInstance' , bookinstance: bookinstance});
        })
        .catch( err => next(err) ); 
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = async (req, res, next) => {
    
    // Assume valid BookInstance id in field.
    await BookInstance.findByIdAndDelete(req.body.id)
        .exec()
        .then(() => res.redirect('/catalog/bookinstances')) // Success, so redirect to list of BookInstance items
        .catch( err => next(err) );
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = async (req, res, next) => {
    
    // Get book, authors and genres for form.
    results = {
        bookinstance: await BookInstance.findById(req.params.id)
                                        .populate('book').exec(),
        books: await Book.find().exec()              
    }

    if(results.bookinstance == null) { // No results.
        let err = new Error('Book Copy not found.');
        err.status = 404;
        return next(err);
    }
    // Success.
    res.render('bookinstance_form', { title: 'Update BookInstance', book_list: results.books, selected_book: results.bookinstance.book._id, bookinstance: results.bookinstance });

};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [

    // Validate fields.
    check('book', 'Book must be specified').trim().isLength({ min: 1 }) ,
    check('imprint', 'Imprint must be specified').trim().isLength({ min: 1 }) ,
    check('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601() ,

    // Sanitize fields
    body('book').trim().escape(),
    body('imprint').trim().escape(),
    body('status').trim().escape(),
    body('due_back').trim().toDate(),

    // Process request after validation and sanitization.
    async (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a BookInstance object with escaped/trimmed data and current id.
        let bookinstance = new BookInstance(
            { 
                book: req.body.book,
                imprint: req.body.imprint,
                status: req.body.status,
                due_back: req.body.due_back,
                _id: req.params.id
           }
        );

        if(!errors.isEmpty()) {
            // There are errors so render form again, passing sanitized values and errors.
            await Book.find({}, 'title')
                .exec()
                .then( books => res.render('bookinstance_form', { title: 'Udate BookInstance', book_list: books, selected_book: bookinstance.book._id, bookinstance: bookinstance, errors: errors.array() }) );
            
                return;
        } else {
            // Data from form is valid.
            await BookInstance.findByIdAndUpdate(req.params.id, bookinstance).exec()
            .then( (thebookinstance) => res.redirect(thebookinstance.url))
            .catch( err => next(err) );
        }
    }
]