'use strict'; //Mozilla/5.0 (X11; Fedora; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36

var express = require('express')
var app = express()
var find = require('spotify-find')
var https=require('https')
var cp = require('child_process');
var currentSongId=null;
var queue = [];

var token = 'BQAJBUVnobCh3YMd4xVaKkNeyviy38anDibBCg__NIYL-8cEtvKVNUu6qE8KO_NBpsIdcDm2dpbsM9yjmn1jNfu5qamRPXIgIjrd-ZNVPjdGwDodVLQzSgHiyOW1VZFEzrCd5HjuPGeZpHxyQkmcl8khhae00jW8wAWn3LmkBtVwvlaNm5ESHyHB87OqoJanVUnE7_jF2ZReQJkqYe2kMmGoEKD7vX_g2fX0pbIOzLt90BECRX1tODMTDtb8oBk0OLXsyqiJQYDFWibxyjmz0izER1na9EBI7qhy7CBMZ4aG9m2cFweN5m_QvUcWxiAVWQS-COxj5y8'

app.get('/', function (req, res) {
    res.send('Hello World!')
});


app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
});

app.get('/webhook', function(req, res){ 
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
    if(currentSongId!==null)
	clearInterval(currentSongId);
    currentSongId=setInterval(function(){changeSong()}, Number(tmp[1]));
}

function doAction(tokens){
    var message="Error";
    if(tokens.length===0)
	return ;
    if(tokens[0].toUpperCase() === "PLAY"){
	tokens.shift();
	var song = tokens.join('+')
	var tracksPureData="";
//	console.log(getSongs(getOptions(6, song+'&type=track')));
	var req = https.request(getOptions(6, song+'&type=track'), (res) => {
	    res.setEncoding('utf8');
	    res.on('data', (chunk) => {
		tracksPureData += chunk;
	    });
	    res.on('end', () => {
//		console.log(JSON.parse(tracksPureData));
		var tracks=JSON.parse(tracksPureData).tracks.items;
//		console.log(tracks);
		play(tracks);
	});
    });
    
    req.on('error', function(e) {
	console.log('problem with request: ' + e.message);})
    req.end();
	/*find({q: song, type: 'track'}).then(function(res) {
	  
	    console.log(res.tracks)
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
	    }
	    else{
		message="Track could not be found";
		console.log(message);
	    } 
	});*/
	message="Song has been received. ("+( queue.length + (currentSongId === null? 0 : 1))+" in queue.)."
    }
    else if(tokens[0].toUpperCase() === "RESUME"){
	runHTTPRequest(getOptions(1))
	message="Song is starting"
    }
    else if(tokens[0].toUpperCase() === "NEXT"){
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
	message="LIGHTS Done!";
    }
    else
	console.log('WHatDaFu')
    return message;
}
function play(tracks){
    console.log(tracks)
    if(tracks.length!=0){
//	console.log('CurrentSong' + currentSongId)
	if(currentSongId !== null){
	    queue.push(['{"uris": ["' + tracks[0].uri + '"]}', tracks[0].duration_ms]);
	    console.log('SE QUEUEO');
	    console.log('Your song has been queued...')
	}
	else{
	    currentSongId=setInterval(function(){changeSong();},
				      Number(tracks[0].duration_ms));
	    console.log("Assigned"+currentSongId);
	    runHTTPRequest(getOptions(1), '{"uris": ["'+ tracks[0].uri+'"]}');
	}
	console.log("Playing Music ...");
    }
    else
	console.log('Track could not be found');
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
    case 6:
	options = {host:'api.spotify.com',
		   path:'/v1/search?q='+query,
		   method:'GET',
		   headers: {
		       'Accept': 'application/json',
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

    console.log('About to do this');
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
    
    if(actions !== ""){
	//console.log(actions)
	req.write(actions)
    }
    req.end();

}
function getSongs(options){
    var tracksData="";
    var tracks;
    var req = https.request(options, (res) => {
//	console.log(res);
//	console.log(`STATUS: ${res.statusCode}`);
//	console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
	res.setEncoding('utf8');
	res.on('data', (chunk) => {
	    //console.log(`BODY: ${chunk}`);
	    tracksData+=chunk;
	});
	res.on('end', () => {
	    //	    console.log('No more data in response.');
//	    console.log(tracksData);
	    //	    console.log(tracksData['tracks']);
	    console.log(JSON.parse(tracksData));
	    tracks=JSON.parse(tracksData).tracks.items;
	    console.log(tracks);
	});
    });
    
    req.on('error', function(e) {
	console.log('problem with request: ' + e.message);})
    req.end();
    return tracksData;
}
