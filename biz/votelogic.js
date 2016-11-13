var mongoose = require('mongoose');

module.exports = function() {

	var logic = {}

	logic.voteValue = function(vote, asOfTime) {
		if (asOfTime == undefined) {
			asOfTime = new Date();
		}
		var startTime = new Date(vote.startTime);
		var endTime = new Date(vote.endTime);
		var sTdifference = asOfTime.getTime() - startTime.getTime();
		var eTdifference = asOfTime.getTime() - endTime.getTime();
		// console.log('asOfTime: ' + asOfTime.toString());
		// console.log('startTime: ' + startTime.toString());
		// console.log('endTime: ' + endTime.toString());
		// console.log('sTdifference: ' + sTdifference + ', eTdifference: ' + eTdifference);
		if (sTdifference >= 0 && eTdifference < 0) {
			return vote.value;
		} else {
			return 0;
		}
	}

	logic.expireVotes = function() {
		mongoose.models.candidate.find( { 'votes.expired': false }, function(error, candidates) {
			if (error) {
				console.log(error.message);
			} else {
				// console.log("Result " + candidates);
				var now = new Date();
				candidates.forEach( function (candidate) {
					candidate.votes.forEach( function(vote) {
						var needSave = false;
						if (!vote.expired) {
							// console.log("Vote to fix: " + vote);
							if (logic.checkAndExpireVote(vote, now)) {
								needSave = true;
							}
						}
						if (needSave) {
							candidate.save(function (err) {
								if (err) {
									console.log(err.message);
								}
							});
						}

					})
				});
			}
		});
	}

	logic.checkAndExpireVote = function(vote, expireTime) {
		if (expireTime == undefined) {
			expireTime = new Date();
		}
		vote.expired = false;

		if (vote.endTime.getTime() < expireTime.getTime()) {
			// console.log("Expired: " + vote._id);
			vote.expired = true;
			return true;
		} else {
			// console.log("Not-expired: " + vote._id);
			return false;
		}
	}

	logic.setVoteEndtime = function(vote) {
		vote.endTime = new Date(vote.startTime.getTime());
		vote.endTime.setMinutes(vote.endTime.getMinutes() + vote.value);
	}

	logic.setVoteStartTimeIfNull = function(vote) {
		if (!vote.startTime) {
			vote.startTime = new Date();
		}
	}

	logic.setEndtimeAndExpired = function(vote) {
		this.setVoteStartTimeIfNull(vote);
		this.setVoteEndtime(vote);
		this.checkAndExpireVote(vote);
	}

	return logic;
}

