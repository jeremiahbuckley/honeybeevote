module.exports = function(dblayer) {

	var logic = {}

	logic.voteValue = function(vote) {
		var d = new Date(vote.starttime);
		var now = new Date();
		now.setMinutes(now.getMinutes() + 10);
		if (now.getTime() - d.getTime() > 0) {
			return vote.value * (now.getMinutes() - d.getMinutes())
		} else {
			return 0;
		}
	}

	logic.expireVotes = function() {
		var model = dblayer.sm.model;
		var sd = new Date();
		var ed = new Date();
		sd.setMinutes(sd.getMinutes() - 10);
		ed.setMinutes(ed.getMinutes() + 10);
		model.vote.find( {
			enddate: {
				$gte: sd,
				$lte: ed
			}
		}, function (error, result) {
			var now = new Date();
			result.forEach( function (current, index, array) {
				checkAndExpireVote(current, now);
			})
		})
	}

	logic.checkAndExpireVote = function(vote, expireTime) {
		if (expireTime == undefined) {
			expireTime = new Date();
		}
		vote.expired = false;

		if (vote.endtime.getTime() < expireTime.getTime()) {
			vote.expired = true;
		}
	}

	logic.setVoteEndtime = function(vote) {
		vote.endtime = new Date(vote.starttime.getTime());
		vote.endtime.setMinutes(vote.endtime.getMinutes() + vote.value);
	}

	logic.setEndtimeAndExpired = function(vote) {
		this.setVoteEndtime(vote);
		this.checkAndExpireVote(vote);
	}

	return logic;
}

