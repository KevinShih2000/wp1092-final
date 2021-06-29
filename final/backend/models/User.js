const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    avatar: String,
    status: Boolean,
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room' }]
});

const User = mongoose.model('User', userSchema);

module.exports = User;
