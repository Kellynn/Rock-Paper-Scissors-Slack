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

app.post('/commands', function(request, response) {
  var userName = request.body.user_name;
  var text = request.body.text.toLowerCase();
  var target = text.split(" ");

  if (text.indexOf('dice roll') > -1) {
    // user wants some dice rolls
    // TODO: expand to more than just 6 sided die
    return response.send(diceRoll(target[2]));
  } else if (text.indexOf('lower higher') > -1) {
    if (text.indexOf('start') > -1) {
      // start lower or higher game
    } else if (text.indexOf('lower') > -1) {
      // user guessed lower
    } else if (text.indexOf('higher') > -1) {
      // user guessed higher
    }
  } else if (text.indexOf('rps') > -1) {
    // User wants to play rock paper scissors - find of which step they are at
    if (text.indexOf('i challenge gamebot') > -1) {
      return response.send(gameBot(userName));
    } else if(text.indexOf('i challenge') > -1) {
      // TODO: add in ability to play against other players
      // Will need to enable slash commands
      response.send(buildResponse("Why don't you challenge GameBot?"));
    } else if (text.indexOf('rock') > -1) {
      var rock = redis.shoot(userName, 'rock');
      response.send(buildResponse(rock));
    } else if (text.indexOf('paper') > -1) {
      var paper = redis.shoot(userName, 'paper');
      response.send(buildResponse(paper));
    } else if (text.indexOf('scissors') > -1) {
      var scissors = redis.shoot(userName, 'scissors');
      response.send(buildResponse(paper));
    } else if (text.indexOf('delete') > -1) {
      response.send(buildResponse(redis.del(userName)));
    }
  }
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

function gameBot(playerName) {
  redis.newMatch(playerName);
  return buildResponse('Rock, Paper, Scissors, SHOOT!');
}

function diceRoll(target) {
  if (target > 10) {
    // too many images will plague slack so 10 seems like a good arbitrary limit
    // that shouldn't be gone over
    return "Too many dice for GameBot";
  }

  // Create an array of all the dice rolls
  // TODO: replace return strings with images
  var dice = [];
  for (var i = 0; i < target; i++) {
    var roll = redis.getRandomNum(1,6);
    switch(roll) {
      case 1:
        dice.push("1");
        break;
      case 2:
        dice.push("2");
        break;
      case 3: 
        dice.push("3");
        break;
      case 4:
        dice.push("4");
        break;
      case 5:
        dice.push("5");
        break;
      case 6:
        dice.push("6");
        break;
      default:
        return "option not found";
    }
  }

  var ret = "Dice Rolls:";
  for each (num in dice) {
    ret = ret + " " + num;
  }

  return ret;
}

/*
* Helper function to build the JSON to send back to Slack.
*/
function buildResponse(text) {
  var json = {
    "text": text,
    "username" : "GameBot"
  }
  return JSON.stringify(json);
}