require("dotenv").config();

var fs = require("fs");
var keys = require('./keys.js');
var Spotify = require('node-spotify-api');
var spotify1 = new Spotify(keys.spotify);
var moment = require('moment');
//var time for bonus log.txt file --atempting
var time = moment().format('HH:mm:ss');
var request = require('request');
var axios = require("axios");

var firstParm = process.argv[2];
var secondParm = process.argv[3];
//attempting to do the Bonus
var logTxt = 'command:' + time + '.Params:' + firstParm + ';' + secondParm + ';\n';

function command(arg) {
    switch (arg) {
        case 'concert-this': {
            bands(secondParm);
            break;
        } case 'spotify-this-song': {
            spotifyFunc(secondParm);
            break;
        } case 'movie-this': {
            if (!secondParm) secondParm = "Mr. Nobody";
            omdb(secondParm);
            break;
        } case 'do-what-it-says': {
            doWhatItSays();
        }
    }
}

/////////////////////////////////////////////////////////////
// node liri.js concert - this < artist / band name here > //
/////////////////////////////////////////////////////////////
function bands(arg) {
    request("https://rest.bandsintown.com/artists/" + arg + "/events?app_id=//API KEY HERE//", function (error, response, body) {
        if (!error && response.statusCode === 200) {
            var data = JSON.parse(body);
            var count = 0;
            for (var i = data.length - 1; i > 0; i--) {
                count++;
                if (count > 10) return;
                var dateOfConcert = data[i].datetime;
                var dateOfConcert1 = moment(dateOfConcert).format("MM/DD/YYYY");
                var result = {
                    "Name of the venue: ": data[i].venue.name,
                    "Venue location: ": data[i].venue.city + ', ' + data[i].venue.country,
                    "Date of the Event: ": dateOfConcert1
                }
                consoleLog(result);
            }
        } else console.log("error", error);
    });
}
///////////////////////////////////////////////////////
// node liri.js spotify-this-song '<song name here>' //
///////////////////////////////////////////////////////
function spotifyFunc(arg) {
    if (arg === undefined) arg = "I Want it That Way";
    spotify1.search({ type: 'track', query: arg, limit: '1' }, function (err, data) {
        log();

        if (err) {
            return console.log('Error occurred:' + err);
        }

        var result = {
            "Artist name:": data.tracks.items[0].album.artists[0].name,
            "Song name:": data.tracks.items[0].name,
            "Preview_URL:": data.tracks.items[0].preview_url,
            "Album name:": data.tracks.items[0].album.name
        }
        consoleLog(result);
    });
}
///////////////////////////////////////////////////
//  node liri.js movie-this '<movie name here>'  //
///////////////////////////////////////////////////
function omdb(arg) {
    axios.get("http://www.omdbapi.com/?t=ed7074d6" + arg + "&y=&plot=short&apikey=trilogy").then(
        function (response) {

            var result = {
                "Title of the movie: ": response.data.Title,
                "Year movie came out: ": response.data.Year,
                "IMDBRating: ": response.data.imdbRating,
                "Rotten Tomatoes Rating: ": response.data.Ratings ? response.data.Ratings[1].Value : "",
                "Country: ": response.data.Country,
                "Language: ": response.data.Language,
                "Plot: ": response.data.Plot,
                "Actors: ": response.data.Actors
            }
            consoleLog(result);
        },
        function (error) {
            console.log("error", error);
        }
    );
}
//////////////////////////////////
// node liri.js do-what-it-says //
//////////////////////////////////
function doWhatItSays() {
    fs.readFile("random.txt", "utf8", function (error, data) {
        if (error) return;
        firstParm = data.split(",")[0].trim();
        secondParm = data.split(",")[1].trim();
        command(firstParm);
    });
}
function consoleLog(obj) {
    for (var key in obj) {
        console.log(key + obj[key]);
    }
}
function log() {
    fs.appendFile('./log.txt', logTxt, function (err) {
        if (err) throw err;
    });
}
command(firstParm);
module.exports = keys;