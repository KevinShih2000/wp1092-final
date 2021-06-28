const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomId: String,
    roomName: String,
    roomPassword: String,
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    messages: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        message: String,
        timestamp: String
    }]
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
