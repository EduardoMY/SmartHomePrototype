'use strict';

var express = require('express')
var app = express()
var find = require('spotify-find')
var connect = require('spotify-local-control')
var client = connect()
var gpio = require('rpi-gpio')

app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})

app.get('/webhook', function(req, res) {
    var action =  (req.query.param1).split(' ');
    console.log(action)
    console.log(req.query.param1)
    doAction(action)
    res.send([{ "text": "Hi. " + (Math.random() * 5 + 1).toFixed(0) + " is a lucky number..."}]);
});

function doAction(tokens){
    if(doAction.length===0)
	return ;
    if(tokens[0]==="Play"){
	tokens.shift();
	var song = tokens.join(' ')
	console.log(song)
	find({q: song, type: 'track'}).then(function(res) {
	    //console.log(res.tracks)
	    client.play(res.tracks.items[0].uri)
	})	
    }
    else if(tokens[0]==="Stop")
	client.stop()
    else if(tokens[0]==="Pause")
	client.pause()
    else if(tokens[0]==="Resume")
	client.resume()
    else
	console.log('WHatDaFu')
	
}
