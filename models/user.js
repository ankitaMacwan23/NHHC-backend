// models/userModel.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  mobile: { type: String, unique: true },
});

module.exports = mongoose.model('User', userSchema);
