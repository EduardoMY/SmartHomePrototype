'use strict'; //Mozilla/5.0 (X11; Fedora; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36

var express = require('express')
var app = express()
var find = require('spotify-find')
var https=require('https')
var cp = require('child_process');
var checkingSongId = null;
var queue = [];

var token = 'BQAdyPbbFm8SEbxXyiuwN40qK0fvYaYmD4zJO01pusxHx2ZxodwpESIsyxrD6CVrSMINzr72zvaMGZ7HTYoeDJdSjPVKztic2S79xzmQ3ufnGhZxa_5-R2_VHW9SGp0kNalu6gQ5-FogwzukH_0Jt0siR8U9WyzXM9dk1wm126kpOwBFTB4gVT9dGZheylFBjck6iXChYgeBEfKUBFsjt4ZLb3JPTKHiGbA2NLx_mxBCmWAydeN9dniHn_6YUQeGW7Y3JQMOsvTMO1hyO4vCwMX3h5VnvijPdgjvNaHhVpwP6KqRMZV7NW_GGkolLszw-Oa2h3zD8gE'

app.get('/', function (req, res) {
    res.send('Hello World!')
    //runHTTPRequest(getOptions(5));
    isPlayingASong();
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
    var message="Fuck Poo";
    if(tokens.length===0)
	return "Fuck Poo 0";
    if(tokens[0].toUpperCase() === "PLAY"){
	tokens.shift();
	var song = tokens.join(' ')
	console.log(song)
	find({q: song, type: 'track'}).then(function(res) {
	    console.log(res.tracks)
	    if(res.tracks.items.length!=0){
		/*
		if(isPlayingASong()){
		    queue.append(res.tracks.items[0].uri, res.tracks.items[0].duration_ms);
		    message = "Your song has been queued...";
		}
		else{*/
		    runHTTPRequest(getOptions(1), '{"uris": ["'+res.tracks.items[0].uri+'"]}');
		    message="Playing Music...";
		//}
		console.log(message);
		return message;
	    }
	    else{
		message="Track could not be found";
		console.log(message);
		return message;
	    }
	});
    }
    else if(tokens[0].toUpperCase() === "RESUME"){
	runHTTPRequest(getOptions(1))
	message="Song is starting"
    }
    else if(tokens[0].toUpperCase() === "PAUSE"){
	runHTTPRequest(getOptions(2));
	message="Song has been Paused";
    }
    else if(tokens[0].toUpperCase() === "NEXT")
	runHTTPRequest(getOptions(3))
    else if(tokens[0].toUpperCase() === "VOLUME")
	runHTTPRequest(getOptions(4, tokens[1]))
    else if(tokens[0].toUpperCase() === "LIGHTS" && tokens.length==3){
	if(tokens[1].toUpperCase() === "OFF" || tokens[1].toUpperCase()==="ON"){
	    cp.exec('python ~/Documents/SmartHomePrototype/lights.py ' + (tokens[1].toUpperCase()==="ON" ? '1':'0') + ' '+ tokens[2],
		    function (err){console.log(err);});
	    console.log("Paso");
	}
    }
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
    case 2: //Pause
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
		   path:'/v1/me/player/volume?volume_percent='+query,
		   method:'PUT',
		   headers: {
		       'Authorization': 'Bearer ' + token
		   }};
	break;
    case 5: //Know Current PLaying Song
	options = {host:'api.spotify.com',
		   path:'/v1/me/player/currently-playing',
		   method:'GET',
		   headers: {
		       'Authorization': 'Bearer ' + token
		   }};
	break;
    default: //Nothing
	options={}
	break;
    }
    return options;
}
function isPlayingASong(){
    var bool;
    var req = https.request(getOptions(5), (res) => {
	res.setEncoding('utf8');
	res.on('data', (chunk) => {
	    var chunk_processed=JSON.parse(chunk);
	    return !chunk_processed.is_playing && chunk_processed.progress_ms==0
	});
	res.on('end', () => {
	    console.log('No more data in response.');
	});
    });
    req.on('error', function(e) {
	console.log('problem with request: ' + e.message);
    });
    req.end()
    return false;
}
function runHTTPRequest(options, actions=""){
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
