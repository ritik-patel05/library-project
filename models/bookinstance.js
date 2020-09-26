let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let BookInstanceSchema = new Schema(
    {
        book: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
        imprint: { type: String, requried: true },
        status: { type: String, requried: true, enum: ['Available', 'Maintenance', 'Loaned', 'Reserved'], default: 'Maintenance' },
        due_back: { type: Date, default: Date.now }
    }
);

// Virtal for bookinstance's URL

BookInstanceSchema
    .virtual('url')
    .get(function () {
        return '/catalog/bookinstance/' + this._id;
    });

// Export Model
module.epxorts = mongoose.model('BookInstance', BookInstanceSchema);