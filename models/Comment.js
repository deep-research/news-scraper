var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new CommentSchema object
var CommentSchema = new Schema({
    title: {
        type: String,
        trim: true,
        required: "A title is required"
    },
    body: {
        type: String,
        trim: true,
        required: "A body is required"
    },
    user: {
        type: String,
        trim: true,
        required: "A body is required"
    },
    date_added: {
        type: Date,
        default: Date.now
    }
});

  // This creates our model from the above schema, using mongoose's model method
var Comment = mongoose.model("Comment", CommentSchema);

// Export the Note model
module.exports = Comment;
