var cool = require('cool-ascii-faces');
var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.send('Hello There!');
});

app.get('/cool', function(request, response) {
  response.send(cool());
});

app.post('/commands', function(request, response) {
  response.send(buildResponse('Test'));
	var commands = request.body.text.toLowerCase().split(" ");
	console.log(commands);

	if(matchCommands(commands, "CHALLENGE")) {
		response.send(buildResponse("Rock, Paper, Scissors, SHOOT!"));
		console.log(request.body.text.toLowerCase());
  	} else if (matchCommands, "ROCK") {
  		// player shoots rock
  	} else if (matchCommands, "PAPER") {
  		// player shoots paper
  	} else if (matchCommands, "scissors") {
  		// player shoots scissors
  	}
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

/*
* Helper function to build the JSON to send back to Slack.
*/
function buildResponse(text) {
  var json = {
    "text": text,
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