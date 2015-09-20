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
  response.send('Hello World! You found the slack GameBot app.');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

app.post('/commands', function(request, response) {
  var userName = request.body.user_name;
  var text = request.body.text.toLowerCase();
  var target = text.split(" ");

  if (exists('dice roll', text)) {
    // user wants some dice rolls
    // TODO: expand to more than just 6 sided die
    return response.send(buildResponse(diceRoll(target[2])));
  } else if (exists('lower higher', text)) {
    // user wants to play the lower or higher card game
    if (exists('start', text)) {
      // start lower or higher game
    } else if (exists('lower', text)) {
      // user guessed lower
    } else if (exists('higher', text)) {
      // user guessed higher
    }
  } else if (exists('rps', text)) {
    // User wants to play rock paper scissors - find of which step they are at
    if (exists('i challenge gamebot', text)) {
      return response.send(buildResponse(gameBot(userName)));
    } else if(exists('i challenge', text)) {
      // TODO: add in ability to play against other players
      // Will need to enable slash commands
      response.send(buildResponse("Why don't you challenge GameBot?"));
    } else if (exists('rock', text) || exists('paper', text) || exists('scissors', text)) {
      var result = redis.shoot(userName, target[1], getRandomNum(1,3));
      response.send(buildResponse(result));
    } else if (exists('delete', text)) {
      response.send(buildResponse(redis.del(userName)));
    }
  }
});

function gameBot(playerName) {
  redis.newMatch(playerName);
  var text = [];
  text[0] = 'Rock, Paper, Scissors, SHOOT!'
  return text;
}

function diceRoll(target) {
  var text = [];
  if (target > 10) {
    // too many images will plague slack so 10 seems like a good arbitrary limit
    // that shouldn't be gone over
    text[0] = "Too many dice for GameBot";
    return text;
  } else if (target == 0) {
    text[0] = "Why are you asking GameBot to roll nothing?";
    return text;
  }else if (target < 0) {
    text[0] = "Don't be so negative";
    return text;
  }

  // Create an array of all the dice rolls
  // TODO: replace return strings with images
  var dice = [];
  for (var i = 0; i < target; i++) {
    var roll = getRandomNum(1,6);
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

  // convert rolls to a single string
  // will eventually be creating attachments with images
  var ret = [];
  ret[0] = "Rolls:";
  for (num of dice) {
    ret[0] = ret[0] + " " + num;
  }

  return ret;
}

/*
* Helper function to build the JSON to send back to Slack.
*/
function buildResponse(text) {
  console.log("Text[0]: " + text[0]);
  console.log("Text[1]: " + text[1]);

  var attachment, attachments = text[1];
  if (attachments) {
    attachment = formatAttachments(attachments);
  }
  var json = {
    "text": text[0],
    "username" : "GameBot",
    "attachment" : JSON.stringify(attachment)
  }
  return JSON.stringify(json);
}

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
function getRandomNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/*
* Return if a string exists in another string
*/
function exists(needle, haystack) {
  // TODO: turn this into a dictionary of commands and then checking
  // for which command is correct
  if (haystack.indexOf(needle) > -1) {
    return 1;
  } else {
    return 0
  }
}

function formatAttachments(attachments) {
  var json, jsonArray = [], i = 0;
  for (attachment of attachments) {
    if (attachment) {
      jsonArray[i] = attachment; 
      i++;  
    }
  }
  return jsonArray;
}