'use strict'
/**
 * Module Dependencies
 */
const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

//type ccan be Add, Delete, Edit
// if A new Item was Added, 
//then delete that item from item list and remove 
// that change log from chang log array

// if an item was delete add that item to item list
// and remove that from change log

// if an item was edited just edit that iem from 
//item list and
// remove the chnage log

let changeLogSchema = new Schema({
    clId : {
        type: String,
        default: '',
        index: true,
        unique: true
    },
    clUserId: {
        type: String,
        default: 'default',
    },
    clUserName: {
        type: String,
        default: 'default'
    },
    clTodoListId: {
        type: String,
        default: '',
        
    },
    clItemId: {
        type: String,
        default: "",
    },
    clType: {
        type: String,
        default: "NONE"//ADD, DELETE, EDIT
    },
    clItemTitle: {
        type: String,
        default: ""
    },
   clItemDetail: {
        type: String,
        default: ""
    }
})


mongoose.model('ChangeLog', changeLogSchema);