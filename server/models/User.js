// import mongoose
const mongoose = require('mongoose')
// create schema
const userSchema = new mongoose.Schema({
  firstName:{
    type:String,
    required:true,
    trim:true
  },
  lastName:{
    type:String,
    required:true,
    trim:true
  },
  email:{
    type:String,
    required:true,
    trim:true
  }, 
  password:{
    type:String,
    required:true
  },
  confirmPassword:{
    type:String,
    required:true
  },
  accountType:{
    type:String,
    enum:["Admin","Student","Instructor"],
    required:true
  },
  additionalDetails:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Profile" 
  },
  courses:[
    {
    type:mongoose.Schema.Types.ObjectId,
    ref:"Course",
   }
  ],
  image:{
    type:String,
    required:true,
  },
  courseProgress:[
    {
    type:mongoose.Schema.Types.ObjectId,
    ref:"CourseProgress"
  }],
  token:{
    type:String
  },
  resetPasswordExpires:{
    type:Date,
  },
  active: {
    type: Boolean,
    default: true,
  },
  approved: {
    type: Boolean,
    default: true,
  },
})
// pre-post middlewares

// export model
module.exports = mongoose.model("User",userSchema)
