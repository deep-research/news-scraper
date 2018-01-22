// Dependencies
var express = require("express");
var mongojs = require("mongojs");
var request = require("request");
var cheerio = require("cheerio");
var bodyParser = require("body-parser")

// Initialize Express
var app = express();

// Use the public folder
app.use(express.static("public"));

// Initialize Body Parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Initialize Handlebars
var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Database configuration
var databaseUrl = "news";
var collections = ["stories"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});

// Initialize mongoose
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/zoo');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
//   console.log("mongoose is on")
});

app.get("/", function(req, res) {
    res.send("Hello world");
});

// Listen on port 3000
app.listen(3000, function() {
    console.log("App running on port 3000!");
  });
  