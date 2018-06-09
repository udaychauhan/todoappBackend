'use strict'
/**
 * Module Dependencies
 */
const mongoose = require('mongoose'),
Schema = mongoose.Schema;

//Friend request status can be 
//-- 1 for awaited
//-- 2 for accepted/friends
let friendRequestSchema = new Schema({
    friendRequestId : {
        type: String,
        default: '',
        index: true,
        unique: true
    },
    senderId: {
        type: String,
        default: '',
    },
    senderUsername: {
        type: String,
        default: '',
    },
    receiverId: {
        type: String,
        default: '',
    },
    receiverUsername: {
        type: String,
        default: '',
    },
    status: {
        type: Number,
        default: 1
    },
   
})


mongoose.model('FriendRequest', friendRequestSchema);