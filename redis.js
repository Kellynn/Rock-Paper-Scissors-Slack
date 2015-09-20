Q = require('q');

var redis,
    rtg;

/* For using RedisToGo on Heroku. If you're not using RedisToGo or Heroku,
* feel free to remove this part and just use
* redis = require("redis").createClient();
*/ 
if(process.env.REDISTOGO_URL) {
  rtg   = require("url").parse(process.env.REDISTOGO_URL);
  redis = require("redis").createClient(rtg.port, rtg.hostname);

  redis.auth(rtg.auth.split(":")[1]);
} else {
  //then we're running locally
  redis = require("redis").createClient();
}

/* Turn Redis Methods Into Promise-returning Ones */

QRedis = {};
QRedis.exists = Q.nbind(redis.exists, redis);

module.exports = {};

var ret = null;

/* Methods for rock, paper scissors
* TODO: add ability to play rps between users, not just against gamebot
*/

module.exports.newMatch = function(playerName) {
	return Qredis.exists("currentBattle")
    .then(function(exists){
      if(!exists) {
        return redis.set(playerName, "true");
      } else {
        throw new Error("Battle exists");
      }
    })	
}

module.exports.shoot = function(playerName, playersChoice, randomNum) {
	// 1 == Rock, 2 == Paper, 3 = Scissors
	var gameBot = randomNum;
	console.log(gameBot);

	if (redis.get(playerName)) {
		if (gameBot == 1 && playersChoice == 'rock'
			|| gameBot == 2 && playersChoice == 'paper'
			|| gameBot == 3 && playersChoice == 'scissors') {
			redis.del(playerName);
			return 'It\'s a tie! GameBot will win next time!';
		}
		if (gameBot == 1 && playersChoice == 'paper'
			|| gameBot == 2 && playersChoice == 'scissors'
			|| gameBot == 3 && playersChoice == 'rock') {
			redis.del(playerName);
			return 'You won! Congrats.';
		} else {
			redis.del(playerName);
			return 'GameBot won! Sorry.';
		}
	} else {
		return 'Please start a match with GameBot';
	}
}

module.exports.del = function(playerName) {
	return redis.exists(playerName)
	    .then(function(exists){
	      if(exists) {
	      	console.log('key deleted');
	      	return redis.del(playerName);
	      } else {
	      	console.log('nothing to delete');
	        throw new Error("No match by that player found");
	    }
    })	
}