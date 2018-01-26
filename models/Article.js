var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new ArticleSchema object
var ArticleSchema = new Schema({
    headline: {
        type: String,
        trim: true,
        required: "A headline is required",
        unique: true
    },
    author: {
        type: String,
        trim: true
    },
    catagory: {
        type: String,
        trim: true
    },
    summary: {
        type: String,
        trim: true,
        required: "A summary is required"
    },
    url: {
        type: String,
        trim: true,
        required: "A url is required"
    },
    date_added: {
        type: Date,
        default: Date.now
    },
    comments: [
        {
            // Store ObjectIds in the array
            type: Schema.Types.ObjectId,
            // The ObjectIds will refer to the ids in the Comment model
            ref: "Comment"
        }
    ]
});

  // This creates our model from the above schema, using mongoose's model method
var Article = mongoose.model("Article", ArticleSchema);

// Export the Article model
module.exports = Article;
