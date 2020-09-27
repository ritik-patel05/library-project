let Book = require('../models/book');
let Author = require('../models/author');
let Genre = require('../models/genre');
let BookInstance = require('../models/bookinstance');


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
exports.book_detail = function(req, res) {
    res.send('NOT IMPLEMENTED: Book detail: ' + req.params.id);
};

// Display book create form on GET.
exports.book_create_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Book create GET');
};

// Handle book create on POST.
exports.book_create_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Book create POST');
};

// Display book delete form on GET.
exports.book_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Book delete GET');
};

// Handle book delete on POST.
exports.book_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Book delete POST');
};

// Display book update form on GET.
exports.book_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Book update GET');
};

// Handle book update on POST.
exports.book_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Book update POST');
};