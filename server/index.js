const express = require('express');
const bodyParser = require('body-parser');
const utils = require('./utils.js');
const Promise = require('bluebird');
const path = require('path');

/*** VARIABLES ***/
var port = process.env.port || 3000;
var app = express();
var allowCrossDomain = function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method == 'OPTIONS') {
    res.send(200);
  } else {
    next();
  }
};

/*** MIDDLEWARE ***/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(allowCrossDomain);
app.use(express.static(path.join(__dirname, '/../client')));

/*** ROUTES ***/
//*CLIENT
app.get('/', function (req, res){
  res.sendFile(path.join(__dirname, '/../client/index.html'));
});

//*USERS
app.post('/users', function (req, res){
  utils.getUser(req.body.user)
    .then(userId => {
      console.log('users', userId)
      res.status(200).send({'userId': userId});
    })
    .catch(err => res.status(500).send(err));
});

//*FAVORITES
app.get('/favorites', function (req, res){
  if (!req.query){
    res.status(400).send({err: 'userId must be passed'});
  } else { //TODO: send back as results.data
    utils.getFavorites(req.query.user)
    .then(favoritesList => res.status(200).send({favorites: favoritesList}))
    .catch(err => res.status(500).send({err: 'Server error has occurred.'}));
  }
});

app.post('/favorites', function (req, res){
  console.log('post to svr/favorites');
  if (!req.body){
    res.status(400).send({err: 'eventId string and userId must be passed'});
  }
  utils.checkFavorite(req.body.user_id, req.body.event_id, req.body.event_info)
    .then(data => res.status(200).send({ data: data }))
    .catch(err => res.status(500).send({err: err}));
});

/*** DB CONNECTION ***/
app.listen(port, () => {
  console.log('listening at', port)
});
