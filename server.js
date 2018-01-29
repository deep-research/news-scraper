// Dependencies
var express = require("express");
var request = require("request");
var cheerio = require("cheerio");
var bodyParser = require("body-parser")
var mongoose = require('mongoose');
var exphbs = require("express-handlebars");
var titleCase = require("./utility/title-case");

// Require all models
var db = require("./models");

// Initialize Express and use the public folder
var app = express();
app.use(express.static("public"));

// Initialize Body Parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Initialize Handlebars
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/news";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

// Regular scraping route with error message functionality
app.get("/index/:error?", function(req, res) {
    db.Article.find({})
        .sort({'date_added': -1})
        .limit(25)
        // Success
        .then(function(records) {
            var displayCount = records.length;
            // If the scrape works for every article
            if (req.params.error === "success") {
                var successObj = {
                    articles: records,
                    errorMessage: "Scrape complete with no errors",
                }
                if (displayCount > 0) {
                    successObj.count = displayCount;
                }
                res.render('index', successObj);
            // If there are duplicates in the database
            } else if (req.params.error === "error") {
                var errorObj = {
                    articles: records,
                    errorMessage: "Scrape complete with errors"
                }
                if (displayCount > 0) {
                    errorObj.count = displayCount;
                }
                res.render('index', errorObj);
            // No error message
            } else {
                var regularObj =  {
                    articles: records
                }
                if (displayCount > 0) {
                    regularObj.count = displayCount;
                }
                res.render('index', regularObj);
            }
        })
        // Error
        .catch(function(err) {
            res.json(err)
        });
});

// Display limit for articles
app.get("/index/limit/:value", function(req, res) {
    var displayLimit =  req.params.value

    if (displayLimit === "25") {displayLimit = 25}
    else if (displayLimit === "50") {displayLimit = 50}
    else if (displayLimit === "100") {displayLimit = 100}

    // A numerical limit
    if (Number.isInteger(displayLimit)) {
        db.Article.find({})
            .sort({'date_added': -1})
            .limit(displayLimit)
            // Success
            .then(function(records) {
                var displayCount = records.length;
                var integerObj = {articles: records}
                if (displayCount > 0) {
                    integerObj.count = displayCount;
                }
                res.render('index', integerObj);
            })
            // Error
            .catch(function(err) {
                res.json(err)
            });
    // No display limit
    } else {
        db.Article.find({})
            .sort({'date_added': -1})
            // Success
            .then(function(records) {
                var displayCount = records.length;
                var stringObj =  {articles: records};
                if (displayCount > 0) {
                    stringObj.count = displayCount;
                }
                res.render('index', stringObj);
            })
            // Error
            .catch(function(err) {
                res.json(err)
            });            
    }
});

// Scrape data from one site and place it into the mongodb db
app.get("/scrape", function(req, res) {
    db.Article.count({})
    // Success
    .then(function(count) {
        console.log("Database count before scraping: " + count)
    })
    // Error
    .catch(function(err) {
        console.log(err)
    }); 

    // Make a request for the news section of the Chicago Tribune
    request("https://www.chicagotribune.com/news/feeds/", function(error, response, html) {
        // Load the html body from request into cheerio
        var $ = cheerio.load(html);

        var articleCount = 0
        $(".trb_outfit_group_list_item_body").each(function(i, element) {articleCount++})
        
        // For each story in the news feed
        $(".trb_outfit_group_list_item_body").each(function(i, element) {
            // Extract the data
            var title = $(element).find(".trb_outfit_relatedListTitle").text().trim();
            var link = "http://www.chicagotribune.com" + $(element).find(".trb_outfit_relatedListTitle_a").attr("href").trim();
            var summary = $(element).find(".trb_outfit_group_list_item_brief").text().trim();
            var catagory = $(element).find(".trb_outfit_categorySectionHeading_a").text().trim();
            var author = titleCase($(element).find(".trb_bylines_nm_au").text().toLowerCase().trim());

            // Create an object from the data
            var obj = {
                headline: title,
                url: link,
                summary: summary,
                catagory: catagory,
                author: author
            }

            // Send new articles to the database
            db.Article.create(obj)
                // Success
                .then(function() {
                    // console.log(i + ": Article added successfully\nTitle: " + title + "\n")

                    // Send a "Scrape Complete" message to the browser
                    if (i === articleCount-1) {
                        res.send("Scrape complete with no errors");

                    db.Article.count({})
                        // Success
                        .then(function(count) {
                            console.log("Database count after scraping: " + count + "\n");
                        })
                        // Error
                        .catch(function(err) {
                            console.log(err);
                        });
                    };
                })
                // Error
                .catch(function(err) {  
                    // console.log(i + ": Article previously added or missing data\nTitle: " + title + "\n");
                    try {
                        return res.send("Scrape complete with errors");                     
                    } catch(error) {}
                    if (i === articleCount-1) {
                        db.Article.count({})
                            // Success
                            .then(function(count) {
                                console.log("Database count after scraping: " + count + "\n")
                            })
                            // Error
                            .catch(function(err) {
                                console.log(err)
                            })
                    } 
                });
            
        });
    });
});

// Create a new comment in the db
app.post("/comment", function(req, res) {
    var commentObj = {
        title: req.body.title,
        comment: req.body.comment,
        user: req.body.user
    }

    db.Comment.create(req.body)
      .then(function(dbComment) {
        // If a Note was created successfully, find one article (there's only one) and push the new comment's _id to the article's `comments` array
        // { new: true } tells the query that we want it to return the updated article -- it returns the original by default
        // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
        return db.Article.findOneAndUpdate({"_id": req.body.id}, { $push: { comments: dbComment._id } }, { new: true });
      })
      .then(function(dbArticle) {
        // If the Article was updated successfully, send it back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurs, send it back to the client
        res.json(err);
      });
  });

  // Display any comments associated with an article
app.get("/comment/:id", function(req, res) {
    var commentId = req.params.id;

    db.Article.findOne({"_id": commentId})
        .populate("comments")
        .then(function(dbArticle) {
            res.json(dbArticle);
        })
        .catch(function(err) {
            res.json(err);
    });
});

// Remove a comment from the database
app.delete("/comment/remove", function(req, res) {
    var commentId = req.query.commentId;
    var articleId = req.query.articleId;

    // Find and remove the comment
    db.Comment.findOneAndRemove({ "_id": commentId }, function (err, response) {
        if (err) throw err;

        // Find and remove the article reference
        db.Article.update(
            { "_id": articleId },
            { "$pull": { "comments": commentId } },
            function (err, response){
                if (err) throw err;
                res.json(response);
            }
        );
    });
});


// Send any other url back to the index page
app.get("/*", function(req, res) {
    res.redirect("/index")
})

// Listen on port 3000
var PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
    console.log("App running on port 3000!");
});
  