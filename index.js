'use strict'; //Mozilla/5.0 (X11; Fedora; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36

var express = require('express')
var app = express()
var find = require('spotify-find')
var https=require('https')
var cp = require('child_process');
var currentSongId=null;
var queue = [];

var token = 'BQAT8yLj6cBwXW5oZh-ZxXedy2yCBivfuLD6sVMgbu1vPEs_v8LDl70RqhSR8RnffhWT8AcHaezyb4eCruSvn67VFyUSVil92gaa4gvVyCxGD0Nl_SDMY6cbWdxAqrvBRapkixWetBlVN3K-BBiEEkFuPh9dYlfxmCyDrPTuf4xxmshAE2aGgumWMeBcbKCt8Cr2ntS4eGNsxaRMAK2bhEVzvh28UuBm4hcXOTczoLMpJ4GF5NZ2yZ1becCfeIo_PLW5En5yRnPbT4jwhjqdGV91a4hNyXIR7gjyTFFRN-JcNwp7ebRlEJBaDpAcHqg0SOg-uC76BNY'

app.get('/', function (req, res) {
    res.send('Hello World!')
});


app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
});

app.get('/webhook', function(req, res) {
    var action =  (req.query.param1).split(' ');
    res.send([{ "text":doAction(action)}]);
});

function changeSong(){
    console.log(queue)
    if(queue.length==0){
	clearInterval(currentSongId);
	currentSongId=null;
	return ;
    }
    makeSongSwitch();
}

function makeSongSwitch(){
    var tmp = queue.shift();
    console.log('Cambio de cancion')
    console.log(tmp[0]);
    runHTTPRequest(getOptions(1), tmp[0]);
    currentSongId=setInterval(function(){changeSong()}, Number(tmp[1]));
}

function doAction(tokens){
    var message="Error";
    if(tokens.length===0)
	return ;
    if(tokens[0].toUpperCase() === "PLAY"){
	tokens.shift();
	var song = tokens.join(' ')
	find({q: song, type: 'track'}).then(function(res) {
//	    console.log(res.tracks)
	    if(res.tracks.items.length!=0){
		console.log('CurrentSong' + currentSongId)
		if(currentSongId !== null){
		    queue.push(['{"uris": ["' + res.tracks.items[0].uri + '"]}', res.tracks.items[0].duration_ms]);
		    console.log('SE QUEUEO');
		    message = "Your song has been queued...";
		}
		else{
		    currentSongId=setInterval(function(){changeSong();},
					    Number(res.tracks.items[0].duration_ms));
		    console.log("Assigned"+currentSongId);
		    runHTTPRequest(getOptions(1), '{"uris": ["'+res.tracks.items[0].uri+'"]}');
		    message="Playing Music...";
		}
		console.log(message);
		return message;
	    }
	    else{
		message="Track could not be found";
		console.log(message);
		return message;
	    } 
	});
	message="Song has been received. ("+( queue.length + (currentSongId === null? 0 : 1))+" in queue.)."
    }
    else if(tokens[0].toUpperCase() === "RESUME"){
	runHTTPRequest(getOptions(1))
	message="Song is starting"
    }
    else if(tokens[0].toUpperCase() === "NEXT"){
	//runHTTPRequest(getOptions(3));
	if(queue.length !== 0){
	    changeSong();
	    message="Done!";
	}
	else
	    message="There is no other Song in queue";
    }
    else if(tokens[0].toUpperCase() === "VOLUME"){
	runHTTPRequest(getOptions(4, tokens[1]))
	message="Done!"
    }
    else if(tokens[0].toUpperCase() === "LIGHTS" && tokens.length==3){
	if(tokens[1].toUpperCase() === "OFF" || tokens[1].toUpperCase()==="ON"){
	    cp.exec('python ~/Documents/SmartHomePrototype/lights.py ' + (tokens[1].toUpperCase()==="ON" ? '1':'0') + ' '+ tokens[2],
		    function (err){console.log(err);});
	}
    }
    else
	console.log('WHatDaFu')
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

function runHTTPRequest(options, actions=""){
    var req = https.request(options, (res) => {
	console.log(`STATUS: ${res.statusCode}`);
//	console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
	res.setEncoding('utf8');
	res.on('data', (chunk) => {
//	    console.log(`BODY: ${chunk}`);
	});
	res.on('end', () => {
//	    console.log('No more data in response.');
	});
    });
    req.on('error', function(e) {
	console.log('problem with request: ' + e.message);})
    if(actions !== ""){
	//console.log(actions)
	req.write(actions)
    }
    req.end();
}
