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
  console.log(request);

  var userName = request.body.user_name;
  var text = request.body.text.toLowerCase();

	if(text.indexOf('i challenge') > -1) {
    redis.newMatch(userName, 'target');
		response.send(buildResponse("Rock, Paper, Scissors, SHOOT!"));
	} else if (text.indexOf('rock') > -1) {
    return redis.Shoot(userName, 'target', 'paper', null)
	} else if (text.indexOf('paper') > -1) {
		response.send(buildResponse('You chose paper'));
	} else if (text.indexOf('scissors') > -1) {
		response.send(buildResponse('You chose scissors'));
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