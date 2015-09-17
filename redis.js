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

QRedis = {};

QRedis.sadd = Q.nbind(redis.sadd, redis);
QRedis.hmset = Q.nbind(redis.hmset, redis);
QRedis.hgetall = Q.nbind(redis.hgetall, redis);
QRedis.exists = Q.nbind(redis.exists, redis);
QRedis.del = Q.nbind(redis.del, redis);
QRedis.set = Q.nbind(redis.set, redis);
QRedis.get = Q.nbind(redis.get, redis);
QRedis.decrby = Q.nbind(redis.decrby, redis);
QRedis.smembers = Q.nbind(redis.smembers, redis);

module.exports = {};

var ret = null;

module.exports.newMatch = function(playerName) {
	return QRedis.exists("currentBattle")
    .then(function(exists){
      if(!exists) {
        return QRedis.set(playerName, "true");
      } else {
        throw new Error("Battle exists");
      }
    })
	// var a, b;
	// QRedis.exists(playerName)
 //    .then(function(exists){
 //      if(!exists) {
 //        a = 'no person found';
 //      } else {
 //        b = 'something exists';
 //      }
 //    })

	// // console.log('a = ' + a);
	// // console.log('b = ' + b);

	// if (redis.exists(playerName)) {
	// 	console.log('added new player: ' + playerName);
	// 	console.log('added new target: ' + targetName);
 //      	// create a running game for the player who started the match
 //      	var success = redis.hmset(playerName, {
 //      		"targetName" : targetName,
 //      		"playersChoice" : "not chosen",
 //      		"targetsChoice" : "not chosen"
 //      	});
 //      	// create a running game for the targeted player
 //      	redis.hmset(targetName, {
 //      		"targetName" : playerName,
 //      		"playersChoice" : null,
 //      		"targetsChoice" : null
 //      	});

 //      	// return message to tell users game started
 //        return "Rock, Paper, Scissors, SHOOT!";
 //     } else {
 //      	ret = "You are already in a match";
 //      	console.log('already in a match');
 //        return ret;
 //    }	
}

module.exports.shoot = function(playerName, playersChoice) {
	// 1 == Rock, 2 == Paper, 3 = Scissors
	var gameBot = getRandomNum(1, 3);
	console.log(gameBot);

	if (redis.get(playerName)) {
		if (gameBot == 1 && playersChoice == 'Paper'
			|| gameBot == 2 && playersChoice == 'Scissors'
			|| gameBot == 3 && playersChoice == 'Rock') {
			QRedis.del(playerName);
			return 'You won! Congrats.';
		} else {
			QRedis.del(playerName);
			return 'GameBot won! Sorry.';
		}
	} else {
		return 'Please start a match with GameBot';
	}
}

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
function getRandomNum(min, max) {
    return Math.random() * (max - min) + min;
}

// module.exports.shoot = function(playerName, playersChoice) {
// 	if ( QRedis.exists(playerName) ) {
//         console.log('shoot');
//         var targetName = null, targetsChoice = null;

//     	// get your game
// 		redis.hgetall(playerName, function (err, results) {
// 		   if (err) {
// 		   		console.log('There was an error in hgetall in shoot');
// 		   } else {
// 		    	// do something with results
// 		    	if (results && results.targetName) {
// 			    	console.log("1: " + results.targetName);
// 			    	targetName = results.targetName;

// 			    	// see if your target has chosen something yet
// 					if (targetName) {
// 						console.log("Checking for targets choice");
// 						redis.hgetall(targetName, function (err, results) {
// 							if (err) {
// 								console.log('There was an error');
// 							} else {
// 								console.log("2: " + results);
// 								if (results.playersChoice) {
// 									// can obtain the other person's play
// 									targetsChoice = results.playersChoice;

// 									// set your choice
// 							    	redis.hmset(playerName, {
// 							    		"targetName" : targetName,
// 							    		"playersChoice" : playersChoice,
// 							    		"targetsChoice" : targetsChoice
// 							    	});

// 							    	console.log("playersChoice: " + playersChoice);
// 							    	console.log("targetsChoice: " + targetsChoice);	

// 							    	// if both choices are filled in, return who won
// 							    	if (playersChoice && targetsChoice) {
// 							    		if (playersChoice === targetsChoice) {
// 							    			redis.del(targetName);
// 							    			redis.del(playerName);
// 							    			return 'It\'s a tie!';
// 							    		} else if (playersChoice == 'paper' && targetsChoice == 'rock'
// 							    			|| playersChoice == 'rock' && targetsChoice == 'scissors'
// 							    			|| playersChoice == 'scissors' && targetsChoice) {
// 							    			redis.del(targetName);
// 							    			redis.del(playerName);
// 							    			return playerName + 'Wins!';

// 							    		} else {
// 							    			redis.del(targetName);
// 							    			redis.del(playerName);
// 							    			return targetName + "Wins!";
// 							    		}
// 							    	}							
// 								} else {
// 									// set your choice
// 							    	redis.hmset(playerName, {
// 							    		"targetName" : targetName,
// 							    		"playersChoice" : playersChoice,
// 							    		"targetsChoice" : targetsChoice
// 							    	});

// 									// player has not chosen yet
// 									return "Waiting for other player to shoot";
// 								}
// 							}
// 						})
// 					}
// 		    	}
// 		   }
// 		});
//     } else {
//       	console.log('a new match needs to be started');
//         ret = "Start a new match: 'rps I challenge ____'";
//         return ret;
//     }
// }

module.exports.del = function(playerName) {
	return QRedis.exists(playerName)
	    .then(function(exists){
	      if(exists) {
	      	console.log('key deleted');
	      	return QRedis.del(playerName);
	      } else {
	      	console.log('nothing to delete');
	        throw new Error("No match by that player found");
	    }
    })	
}