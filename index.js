'use strict';

//Mozilla/5.0 (X11; Fedora; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36


var express = require('express')
var app = express()
var find = require('spotify-find')
var https=require('https')

var token = 'BQCGgzVG3XxEn91hvu_mGrqqgl6IloBamqhVtFCXohy53RI1oiMqbaPG9OjlGHSsQ1ARwNbkjb7do0KdeLqTVAukww-H9BjxX2n0ShGRBBSxm3dTZq1J3HWBu1NDTij386fW3pciD9kISPNq14EtSCmct0BY8c98SMluM3b9dBNNsXxDe9N0udNLDTVZtDwo1Sh9T1w2Vst0r4nmaDZnlRh8utJfnJAbO84LjD1u_75FbvvI08g39IO3Q7WCmcQFZtMOXFElpglArdbSk6KZjZlmTTrWladjGp2wVXfZrn-Oqah-qK2tDHTLnnKEaoR-jtOCuTC-Szc'


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
    var message="Fuck Poo"
    if(tokens.length===0)
	return "Fuck Poo 0";
    if(tokens[0].toUpperCase() === "PLAY"){
	tokens.shift();
	var song = tokens.join(' ')
	console.log(song)
	find({q: song, type: 'track'}).then(function(res) {
	    console.log(res.tracks)
	    if(res.tracks.items.length!=0){
		runHTTPRequest(getOptions(1), '{"uris": ["'+res.tracks.items[0].uri+'"]}')
		message="Playing Music...";
		return message;
	    }
	    else{
		message="Track could not be found";
		return message;
	    }
	    
	});
    }
    else if(tokens[0].toUpperCase() === "RESUME"){
	runHTTPRequest(getOptions(1), "")
	message="Song is starting"
    }
    else if(tokens[0].toUpperCase() === "PAUSE"){
	runHTTPRequest(getOptions(2), "");
	message="Song has been Paused";
    }
    else if(tokens[0].toUpperCase() === "NEXT")
	runHTTPRequest(getOptions(3), "")
    else if(tokens[0].toUpperCase() === "VOLUME")
	runHTTPRequest(getOptions(4, tokens[1]), "")
    else console.log('WHatDaFu')
    
    return message;
}

function getOptions(action, query=""){
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
    case 4: //Volume
	options = {host:'api.spotify.com',
		   path:'/v1/me/player/volume?volume_percent=50',
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
