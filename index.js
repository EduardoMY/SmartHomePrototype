'use strict';

//Mozilla/5.0 (X11; Fedora; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36


var express = require('express')
var app = express()
var find = require('spotify-find')
var gpio = require('rpi-gpio')
var https=require('https')

var token = ''

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
    res.send([{ "text": doAction(action)}]);
});

function doAction(tokens){
    if(tokens.length===0)
	return "Fuck Poo 0";
    if(tokens[0]==="Play"){
	tokens.shift();
	var song = tokens.join(' ')
	console.log(song)
	find({q: song, type: 'track'}).then(function(res) {
	    console.log(res.tracks)
	    runHTTPRequest(getOptions(1), '{"uris": ["'+res.tracks.items[0].uri+'"]}')
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
    
    return "Fuck Poo"
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
