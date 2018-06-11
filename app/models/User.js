'use strict'
/**
 * Module Dependencies
 */
const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

let userSchema = new Schema({
  userId: {
    type: String,
    default: '',
    index: true,
    unique: true
  },
  firstName: {
    type: String,
    default: 'default'
  },
  lastName: {
    type: String,
    default: 'default'
  },
  password: {
    type: String,
    default: 'passskdajakdjkadsj'
  },
  emailId: {
    type: String,
    default: 'defaultemail@default.com'
  },
  countryCode : {
    type : Number,
    default : 0
  },
  phoneNumber: {
    type: Number,
    default: 0
  },
  createdOn :{
    type:Date,
    default:""
  }
})


mongoose.model('User', userSchema);