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

// Connect to the Mongoose
mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/news");

app.get("/index", function(req, res) {
    db.Article.find({})
        .sort('date_added')
        .limit(15)
        .populate("Comment")
        // Success
        .then(function(records) {
            res.render('index', {articles: records});
        })
        // Error
        .catch(function(err) {
            res.json(err)
        });
});

// Scrape data from one site and place it into the mongodb db
app.get("/scrape", function(req, res) {

    // Make a request for the news section of the Chicago Tribune
    request("https://www.chicagotribune.com/news/feeds/", function(error, response, html) {
        // Load the html body from request into cheerio
        var $ = cheerio.load(html);
        
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
                    console.log("Article added successfully\nTitle: " + title + "\n")
                })
                // Error
                .catch(function(err) {
                    console.log("Article previously added or missing data\nTitle: " + title + "\n");
                    // return res.json(err);
                });
        });
        // Send a "Scrape Complete" message to the browser
        res.send("Scrape Complete");
    });
});

// Send any other url back to the index page
app.get("/*", function(req, res) {
    res.redirect("/index")
})

// Listen on port 3000
app.listen(3000, function() {
    console.log("App running on port 3000!");
});
  