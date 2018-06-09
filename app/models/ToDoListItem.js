'use strict'
/**
 * Module Dependencies
 */
const mongoose = require('mongoose'),
Schema = mongoose.Schema;

let todoListItemSchema = new Schema({
    //userId and userName 
    //can be of any user who has access to that todolist
    userId : {
        type : String,
        default : ''
    },
    userName : {
        type : String,
        default : ""
    },
    todoListId: {
        type: String,
        default: '',
    },
    todoListName: {
        type: String,
        default: 'No Name'
    },
    parentItemId: {
        type: String,
        default: '',
    },
    parentItemTitle: {
        type: String,
        default: '',
    },
    itemId: {
        type: String,
        default: "",
        index: true,
        unique: true
    },
    itemTitle: {
        type: String,
        default: "No Item Title"
    },
    itemDetail: {
        type: String,
        default: "No Item Detail"
    }, 
    createdOn: {
        type: Date,
        default: ""
    },
    modifiedOn: {
        type: Date,
        default: ""
    }
})


mongoose.model('ToDoListItem', todoListItemSchema);