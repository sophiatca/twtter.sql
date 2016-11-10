'use strict';
var express = require('express');
var router = express.Router();
var tweetBank = require('../tweetBank');
var client = require('../db/index');

module.exports = function makeRouterWithSockets (io) {

  // a reusable function
  function respondWithAllTweets (req, res, next){
    // var allTheTweets = tweetBank.list();
    // res.render('index', {
    //   title: 'Twitter.js',
    //   tweets: allTheTweets,
    //   showForm: true
    // });
    client.query('SELECT tweets.id, userid, content, name, pictureurl  FROM tweets INNER JOIN users ON tweets.userid = users.id', function (err, result) {
    if (err) return next(err); // pass errors to Express
    var tweets = result.rows;
    res.render('index', {
      title: 'Twitter.js',
      tweets: tweets,
      showForm: true });
    });

  }

  // here we basically treet the root view and tweets view as identical
  router.get('/', respondWithAllTweets);
  router.get('/tweets', respondWithAllTweets);

  // single-user page
  router.get('/users/:username', function(req, res, next){
    // var tweetsForName = tweetBank.find({ name: req.params.username });
    // res.render('index', {
    //   title: 'Twitter.js',
    //   tweets: tweetsForName,
    //   showForm: true,
    //   username: req.params.username
    // });

    client.query('SELECT * FROM tweets INNER JOIN users ON tweets.userid = users.id  WHERE name = $1',[req.params.username], function (err, result){
        if (err) return next(err); // pass errors to Express
        var tweets = result.rows;
        res.render('index', {
          title: 'Twitter.js',
          tweets: tweets,
          showForm: true,
          username: req.params.username });
    });
  });

  // single-tweet page
  router.get('/tweets/:id', function(req, res, next){
    // var tweetsWithThatId = tweetBank.find({ id: Number(req.params.id) });
    // res.render('index', {
    //   title: 'Twitter.js',
    //   tweets: tweetsWithThatId // an array of only one element ;-)
    // });
    client.query('SELECT * FROM tweets WHERE id = $1',[req.params.id], function (err, result){
        if (err) return next(err); // pass errors to Express
        var tweets = result.rows;
        res.render('index', {
          title: 'Twitter.js',
          tweets: tweets, });
    });

  });

  // post a tweet with existing name
  router.post('/tweets', function(req, res, next){
    // var newTweet = tweetBank.add(req.body.name, req.body.content);


     client.query('INSERT INTO tweets (userid, content) VALUES ((SELECT id from users where name= $1),$2)',[req.body.name, req.body.content],function(err,result){
      if (err) next();
    });
    res.redirect('/');
  });

//post a tweet with a new name
  router.post('/tweets', function(req, res, next){
    // var newTweet = tweetBank.add(req.body.name, req.body.content);
    var url ='http://i.imgur.com/XDjBjfu.jpg';
    client.query('INSERT INTO users (name, pictureurl) VALUES ($1, $2)', [req.body.name,url],function(err,result){
      if (err) return next(err);
    });

     client.query('INSERT INTO tweets (userid, content) VALUES ((SELECT id from users where name= $1),$2)',[req.body.name, req.body.content,],function(err,result){
    if (err) return next(err);
    });
    res.redirect('/');
  });




  // client.query('SELECT name FROM users WHERE name=$1', ['Nimit'], function (err, data) {
  //   console.log ("selecting Nimit")
  // });

  //client.query('INSERT INTO tweets (userId, content) VALUES ($1, $2)', [10, 'I love SQL!'], function (err, data) {/** ... */});

  // // replaced this hard-coded route with general static routing in app.js
  // router.get('/stylesheets/style.css', function(req, res, next){
  //   res.sendFile('/stylesheets/style.css', { root: __dirname + '/../public/' });
  // });

  return router;
}

