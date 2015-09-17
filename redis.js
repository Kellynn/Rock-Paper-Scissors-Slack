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

module.exports.newMatch = function(playerName, targetName) {
	return QRedis.exists(playerName)
	    .then(function(exists){
	      if(!exists) {
	      	console.log('added new player');
	      	var success = redis.set(playerName, targetName);
	      	console.log(success);
	        return success;
	      } else {
	      	ret = "You are already in a Match";
	      	console.log('already in a match');
	        return ret;
	    }
    })	
}

module.exports.shoot = function(playerName, targetName, playersChoice, targetsChoice) {
	return QRedis.exists(playerName)
	    .then(function(exists){
	      if(exists) {
	        if (QRedis.get(playerName)) {
	        	console.log('shoot');
	        	redis.rpush(playerName, playersChoice);
	        	// QRedis.hmset(playerName, {
	        	// 	"targetName" : targetName,
	        	// 	"playersChoice" : playersChoice,
	        	// 	"targetsChoice" : targetsChoice
	        	// });
	        	console.log('1: ' + redis.lrange(playerName, 0, 1));
	        	// console.log('2: ' + redis.hget(playerName, "targetName"));
	        	// console.log('3: ' + redis.hmget(playerName, "targetName"));
	        	// console.log('4: ' + redis.hgetall(playerName));
	        	var results = QRedis.hgetall(playerName, function(err, object) {
    				console.log(object);
				});
	        	// console.log('The result ' + results[targetName]);
	        	// console.log('The result or ' + results['targetName']);
	        	// console.log('The other results ' + results[0][0]);
	        	// console.log('The maybe results ' + results.targetName);
	        	// console.log('What about this' + results[0]);
	        	// console.log(results);
	        	// console.log(playerName);
	        	return QRedis.get(playerName);
	        }
	      } else {
	      	console.log('a new match needs to be started');
	        ret = "Start a new match: 'rps I challenge ____'";
	        return ret;
	    }
    })	
}

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