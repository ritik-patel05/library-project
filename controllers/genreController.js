let Genre = require('../models/genre');
let Book = require('../models/book');
const genre = require('../models/genre');

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
    res.send('NOT IMPLEMENTED: Genre create GET');
};

// Handle Genre create on POST.
exports.genre_create_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre create POST');
};

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