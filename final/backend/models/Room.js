const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomId: String,
    roomName: String,
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    messages: [{
        name: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        message: String
    }]
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
