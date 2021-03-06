const mongoose = require('mongoose');

function authorize(username, password, cb) {
  mongoose.models.voter.findOne({name: username}, (error, result) => {
    if (error) {
      return cb(error);
    }
    if (!result) {
      return cb(null, false);
    }
    if (result.password !== password) {
      return cb(null, false);
    }
    return cb(null, result);
  });
}

module.exports = {auth: authorize};
