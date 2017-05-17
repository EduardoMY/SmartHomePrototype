'use strict';

var express = require('express')
var app = express()
var find = require('spotify-find')
var connect = require('spotify-local-control')
var client = connect()
var gpio = require('rpi-gpio')
var https=require('https')

var token = 'BQB-vecuScLUoJ6Fa07CIwgwxsZQ2n-1t1FLSpT9lR-GZVf5JrM7u-oNyhfe2IAqxm6pghyihofB7EY3ma1ug9GglLguPDUIIq0wZmyiTL3FaDEEgUqhnXazxaI4K3ySJ0Vr4RnUWEKP8W4T1bXr1NvITtY77LSaLaNLy8A9OLg77-g4N_jpS9pzH-9PvCiURWAy-DOKZSc9UaoWiz6QqOAyVrwTS6beiIRkhdnPOHPkcJjq6d2SAlHCWrLcZ-3BIZ78DElI2OVIV820_zvaNcd0MIoYYdB0welz1khUg9iUcKlb4LmzBlR_nk1WQEvakRGSSMaeOtU'

app.get('/', function (req, res) {
  res.send('Hello World!')
})

var options = {host:'api.spotify.com',
	       path:'/v1/me/player/pause',
	       method:'PUT',
	       headers: {
		   'Authorization': 'Bearer ' + token
	       }};

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
    if(tokens.length===0)
	return ;
    if(tokens[0]==="Play"){
	tokens.shift();
	var song = tokens.join(' ')
	console.log(song)
	find({q: song, type: 'track'}).then(function(res) {
	    console.log(res.tracks)
	    runHTTPRequest(getOptions(1), '{"uris": ["'+res.tracks.items[0].uri+'"]}')
	    //client.play(res.tracks.items[0].uri)
	});	
    }
    else if(tokens[0]=="Resume")
	runHTTPRequest(getOptions(1), "")
    else if(tokens[0]==="Pause")
	runHTTPRequest(getOptions(2), "")
    else if(tokens[0]==="Next")
	runHTTPRequest(getOptions(3), "")
    else
	console.log('WHatDaFu')	
}

function getOptions(action){
    var options;
    switch(action){
    case 1: //Play
	options = {host:'api.spotify.com',
	       path:'/v1/me/player/play',
	       method:'PUT',
	       headers: {
		   'Authorization': 'Bearer ' + token
	       }};
	break;
    case 2://Pause
	options = {host:'api.spotify.com',
		   path:'/v1/me/player/pause',
		   method:'PUT',
		   headers: {
		       'Authorization': 'Bearer ' + token
		   }};
	break;
    case 3: //Next
	options = {host:'api.spotify.com',
		   path:'/v1/me/player/next',
		   method:'PUT',
		   headers: {
		       'Authorization': 'Bearer ' + token
		   }};
	break;
    default://Nothing
	options={}
	break;
    }
    return options;
}
function runHTTPRequest(options, actions){
    var req = https.request(options, (res) => {
	console.log(`STATUS: ${res.statusCode}`);
	console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
	res.setEncoding('utf8');
	res.on('data', (chunk) => {
	    console.log(`BODY: ${chunk}`);
	});
	res.on('end', () => {
	    console.log('No more data in response.');
	});
    });
    req.on('error', function(e) {
	console.log('problem with request: ' + e.message);})
    if(actions){
	console.log(actions)
	req.write(actions)
    }
    req.end();
}
