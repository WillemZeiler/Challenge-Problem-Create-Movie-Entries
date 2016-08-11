var express = require('express'),
    app = express(),
    engines = require('consolidate'),
    MongoClient = require('mongodb').MongoClient,
    assert = require('assert');
bodyParser = require('body-parser');

app.engine('html', engines.nunjucks);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use(bodyParser.urlencoded({
    extended: true
}));

MongoClient.connect('mongodb://localhost:27017/video', function(err, db) {

    assert.equal(null, err);
    console.log("Successfully connected to MongoDB.");

    function errorHandler(err, req, res, next) {
        res.status(500).render('error_template', {
            error: err
        });
    }

    app.get('/', function(req, res, next) {
        res.render('insert_movie');
    });

    app.get('/hello', function(req, res) {
        db.collection('movies').find({}).toArray(function(err, docs) {
            var numMovies = docs.length - 1;
            console.log(numMovies);
            res.render('hello', {
                'name': docs[numMovies].title
            });
        });

    });

    app.post('/addMovie', function(req, res, next) {
        var movie = req.body;
        if (typeof movie.movie_title == 'undefined') {
            next('Please choose a fruit!');
        } else {
            res.render('inserted_movie', {
                'movie_title': movie.movie_title,
                'movie_year': movie.movie_year,
                'movie_imdbCode': movie.movie_imdbCode
            });
            db.collection('movies').insertOne({
                'title': movie.movie_title,
                'year': movie.movie_year,
                'imdb': movie.movie_imdbCode
            });
        }
    });

    app.use(function(req, res) {
        res.sendStatus(404);
    });

    var server = app.listen(3000, function() {
        var port = server.address().port;
        console.log('Express server listening on port %s.', port);
    });

});