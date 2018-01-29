# news-scraper

[The Paper Scraper](https://the-paper-scraper.herokuapp.com/)

A full stack web application for scraping and commenting on articles from the Chicago Tribune newspaper. The data is stored in Mongo DB with the Mongoose framework.  

## Installing

* Create a database called `news` in Mongo DB.
* Run NPM install to get the necessary packages
* The program should automatically initialize the collections and insert data when you run the `node server.js` command in your command line.

### Prerequisites

* Node.JS
* Mongo DB

### Technologies Used

* Node.JS
* Express
* Handlebars
* Mongo DB
* Mongoose
* Cheerio

## Deployment

* This project can be deployed to Heroku with the mLab database and the `MONGODB_URI` configuration variable on the Heroku settings page.

## Built With

* [To Title Case](https://github.com/gouch/to-title-case/blob/master/to-title-case.js) - A title case conversion function.

## Authors

* **Code Master: Victor** - *Everything!* - [Deep Research](https://github.com/deep-research)

## Comments

* This project was a lot of fun. The asynchronous database queries for the scraper were in a loop, so I had to figure out some clever ways to count them. Writing the jQuery was also very enjoyable. Getting the comment related sections to collapse properly took a surprising amount of trickery.
