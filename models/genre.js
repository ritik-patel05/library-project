let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let GenreSchema = new Schema(
    {
        name: { type: String, minlength:3, maxlength:100, requried: true },
    }
);

// Virtual function for creating url
GenreSchema
    .virtual('url')
    .get(function () {
        return '/catalog/genre/' + this._id;
    });

// Export Model.
module.exports = mongoose.model('Genre', GenreSchema);