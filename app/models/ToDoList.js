'use strict'
/**
 * Module Dependencies
 */
const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

let todoListSchema = new Schema({
    userId: {
        type: String,
        default: '',
    },
    userName: {
        type: String,
        default: ''
    },
    todoListId: {
        type: String,
        default: '',
        index: true,
        unique: true
    },
    todoListTitle: {
        type: String,
        default: 'No Name'
    },
    createdOn: {
        type: Date,
        default: ""
    },

});


mongoose.model('ToDoList', todoListSchema);
