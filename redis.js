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

module.exports.newMatch = function(playerName, targetName) {
	return QRedis.exists(playerName)
	    .then(function(exists){
	      if(!exists) {
	        return QRedis.hmset(playerName, {
	        	"targetName" : targetName,
	        	"playersChoice" : null,
	        	"targetsChoice" : null
	        })
	      } else {
	        throw new Error("You are already in a Match");
	    }
    })	
}

module.exports.shoot = function(playerName, targetName, playersChoice, targetsChoice) {
	return QRedis.exists(playerName)
	    .then(function(exists){
	      if(exists) {
	        if (QRedis.get(playerName)) {
	        	QRedis.hmset(playerName {
	        		"targetName" : targetName,
	        		"playersChoice" : playersChoice,
	        		"targetsChoice" : targetsChoice
	        	});
	        	return QRedis.get(playerName);
	        }
	      } else {
	        throw new Error("Start a new match: 'rps I challenge ____'");
	    }
    })	
}