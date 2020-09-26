let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let AuthorSchema = new Schema(
    {
        first_name: { type: String, required: true, maxlength: 100 },
        family_name: { type: String, required: true, maxlength: 100 },
        date_of_birth: { type: Date },
        date_of_death: { type: Date },
    }
);

// Virtual for author's full name.

AuthorSchema
    .virtual('name')
    .get(function () {
        // To avoid errors in cases where an author does not have either a family name or first name
        // We want to make sure we handle the excpetion by returning an empty string for that case.

        let fullName = '';
        if(this.first_name && this.family_name) {
            fullName = `${this.family_name} ${this.first_name}`;
        }
        
        return fullName;
    });

// Virtual for author's Lifespan

AuthorSchema
    .virtual('lifespan')
    .get(function () {
        return (this.date_of_death.getYear() - this.date_of_birth.getYear()).toString();
    });

// Virtual for author's URL

AuthorSchema
    .virtual('url')
    .get(function () {
        return '/catalog/author/' + this._id;
    });

// Export Module
module.exports = mongoose.model('Author', AuthorSchema);