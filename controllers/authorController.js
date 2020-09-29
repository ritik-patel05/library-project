let Author = require('../models/author');
let Book = require('../models/book');

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
    res.send('NOT IMPLEMENTED: Author create GET');
};

// Handle Author create on POST.
exports.author_create_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Author create POST');
};

// Display Author delete form on GET.
exports.author_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Author delete GET');
};

// Handle Author delete on POST.
exports.author_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Author delete POST');
};

// Display Author update form on GET.
exports.author_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Author update GET');
};

// Handle Author update on POST.
exports.author_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Author update POST');
};