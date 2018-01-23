// Dependencies
var express = require("express");
var mongojs = require("mongojs");
var request = require("request");
var cheerio = require("cheerio");
var bodyParser = require("body-parser")
var mongoose = require('mongoose');
var exphbs = require("express-handlebars");

// Require all models
var db = require("./models");

// Initialize Expressand use the public folder
var app = express();
app.use(express.static("public"));

// Initialize Body Parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Initialize Handlebars
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Database configuration
var databaseUrl = "news";
var collections = ["Article", "Comment"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
    console.log("Database Error:", error);
});

// Initialize mongoose
// mongoose.connect('mongodb://localhost/news');
// var db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', function() {
//     console.log("Mongoose is connected")
// });

// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/news");

app.get("/", function(req, res) {
    res.send("Hello world");
});

// Listen on port 3000
app.listen(3000, function() {
    console.log("App running on port 3000!");
});
  