var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

module.exports = function() {

	router.get('/', function(req, res) {
		mongoose.models.election.find(null, returnGet(req, res))
	});

	router.get('/:id', function(req, res) {
		mongoose.models.election.findOne({ _id: req.params.id }, returnGet(req, res));
	});

	function returnGet (req, res) {
		return function (error, response) {
			if (error != null) {
				res.status(500).send(error);
			} else {
				if (response == null || response == undefined || response.length == 0) {
					res.status(404).send();
				} else {
					res.status(200).send(response)
				}
			}
		} 
	}

	router.post('/:id/candidateid/', function(req, res) {
		pushPullElectionParticipantIds(req, res, req.params.id, req.body.candidateId, true, true);
	});

	router.post('/:id/voterid/', function(req, res) {
		pushPullElectionParticipantIds(req, res, req.params.id, req.body.voterId, true, false);
	});

	router.post('/', function(req, res) {
		var election = new mongoose.models.election(req.body);
		election.save(function (error, response) {
			if (error != null) {
				res.status(500).send(error);
			} else {
				res.status(201).send(req.originalUrl + "/" + response._id);
			}
		});
	});

	router.put('/:id', function(req, res) {
		mongoose.models.election.findOne({ _id: req.params.id}, function(error, response) {
			if (error != null) {
				res.status(500).send(error);
			} else {
				if (response == null || response == undefined || response.length == 0) {
					var election = new mongoose.models.election(req.body);
					election.save(function (error, response) {
						if (error != null) {
							res.status(500).send(error);
						} else {
							res.status(201).send(req.originalUrl + "/" + response._id);
						}
					});
				} else {
					mongoose.models.election.update( { _id: response._id } , 
						req.body, 
						{ runValidators: true },
						function (error) {
						if (error != null) {
							res.status(500).send(error);
						} else {
							res.status(200).send(req.originalUrl);
						}
					});
				}
			}
		});
	});

	router.delete('/:id/candidateid/:candidateId', function(req, res) {
		pushPullElectionParticipantIds(req, res, req.params.id, req.params.candidateId, false, true);
	});

	router.delete('/:id/voterid/:voterId', function(req, res) {
		pushPullElectionParticipantIds(req, res, req.params.id, req.params.voterId, false, false);
	});

	router.delete('/:id', function(req, res) {
		mongoose.models.election.find({ _id: req.params.id}, function (error, response) {
			if (error != null) {
				res.status(500).send(error)
			} else {
				if (response == null || response == undefined || response.length == 0) {
					res.status(404).send();
				} else {
					mongoose.models.election.remove({ _id: req.params.id }, function(error) {
						if (error != null) {
							res.status(500).send(error);
						} else {
							res.status(200).send();
						}
					});
				}
			}
		})
	});

	function pushPullElectionParticipantIds( req, res, electionId, participantId, isPush, isCandidateId) {
		var update = {};
		var verb = "";
		var participantType = "";
		if (isPush) {
			verb = "$push";
		} else {
			verb = "$pull"
		}
		update[verb] = {}
		if (isCandidateId) {
			participantType = "candidateIds";
		} else {
			participantType = "voterIds";
		}
		update[verb][participantType] = mongoose.Types.ObjectId(participantId);

		mongoose.models.election.findOne({ _id: electionId}, function(error, response) {
			if (error != null) {
				res.status(500).send(error);
			} else {
				if (response == null || response == undefined || response.length == 0) {
					res.status(500).send("Election " + electionId + " does not exist.");
				} else {
					mongoose.models.election.update( { _id: response._id } , 
						update, 
						{ runValidators: true },
						function (error) {
						if (error != null) {
							res.status(500).send(error);
						} else {
							res.status(200).send(req.originalUrl);
						}
					});
				}
			}
		});
	}

	return router;
}
