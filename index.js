var express = require('express'),
  bodyParser = require('body-parser'),
  redis = require('./redis.js'),
  app = express();

app.set('port', (process.env.PORT || 5000));
 
// body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

// views is directory for all template files
// app.set('views', __dirname + '/views');
// app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.send('Hello There!');
});

app.get('/cool', function(request, response) {
  response.send(cool());
});

app.post('/commands', function(request, response) {
  var userName = request.body.user_name;
  var text = request.body.text.toLowerCase();
  var target = text.split(" ");

	if (text.indexOf('i challenge gamebot') > -1) {
    return response.send(gameBot(playerName));
  } else if(text.indexOf('i challenge') > -1) {
    var start = redis.newMatch(userName, target[3]);
		response.send(buildResponse(start);
	} else if (text.indexOf('rock') > -1) {
    var rock = redis.shoot(userName, 'rock');
    console.log('rock return from redis: ' + rock);
    response.send(buildResponse(rock));
	} else if (text.indexOf('paper') > -1) {
		var paper = redis.shoot(userName, 'paper');
    console.log('paper return from redis: ' + paper);
    response.send(buildResponse(paper));
	} else if (text.indexOf('scissors') > -1) {
    var scissors = redis.shoot(userName, 'scissors');
    console.log('scissors return from redis: ' + scissors);
    response.send(buildResponse(paper));
	} else if (text.indexOf('delete') > -1) {
    response.send(buildResponse(redis.del(userName)));
  }
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

function gameBot(playerName) {
  return buildResponse('Gamebot doesn\'t want to play right now');
}

/*
* Helper function to build the JSON to send back to Slack.
*/
function buildResponse(text) {
  var json = {
    "text": text,
    "username" : GameBot
  }
  return JSON.stringify(json);
}

/*
* Helper function to match commands, instead of a switch statement,
* because then you can do stuff like use Regex here or something fancier.
* Also keeps all the possible commands and their trigger words in one place.
*/
function matchCommands(commandArray, command) {
  var commandsDict = {
    "CHALLENGE": "I challenge",
    "PAPER": "paper",
    "ROCK" : "rock",
    "SCISSORS" : "scissors"
  }
  var cmdString = commandArray.join(" ").toLowerCase().replace("rps ", "");
  return cmdString.indexOf(commandsDict[command]) === 0;
}