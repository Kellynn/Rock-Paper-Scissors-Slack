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
	response.send(buildResponse('IT\'S WORKING'));
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
    "username": "CraftBot"
  }
  return JSON.stringify(json);
}