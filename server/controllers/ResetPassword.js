const User = require('../models/User')
const OTP = require('../models/OTP')
const crypto = require('crypto')
require('dotenv').config();
const {mailSender} = require('../utils/mailSender')
const bcrypt = require('bcrypt')


// resetPassword token - unique token generation, storing token in user , url generation 
exports.resetPasswordToken = async(req,res)=>{
  try{
    // fetch email 
    const email = req.body.email;
    // validate email
    if(!email.includes("@gmail.com")){
      return res.status(400).json({
        success:false,
        message:"Not a valid email address"
      })
    }
    // check email in db
    const user = await User.findOne({email:email});
    if(!user){
      return res.status(400).json({
        success:false,
        message:"User does not exist"
      })
    }
    // generate token 
    console.log("token generate hone wala hai")
    const token = crypto.randomUUID();// used to generate random st
    console.log("token generate hoooo gyyaaaa..")
    // add token and reset password expires time in user db
    const updatedUser = await User.findOneAndUpdate(
                                    {email:email},
                                    {
                                      token:token,
                                      resetPasswordExpires:Date.now()+ 5*60*1000
                                    },
                                    {new:true})
    console.log("User update ho gyaa")
    // generate url(front end url) unique for user with the help of token
    const url = `http://localhost:3000/update-password/${token}`
    console.log("Url create ho gyii")
    // send mail to the user containing the reset password url 
    await mailSender(email,
                   "Reset Password Link",
                   `Go to the link to Update your password : ${url}`)
     console.log("Mail sent ho gyaa")              
    // return response
    return res.status(200).json({
    success:true,
    messge:"Email sent successfully, please check & update password"
  })
  }catch(err){
    console.log("error message in server ",err)
    return res.status(500).json({
      success:false,
      messge:`Can't generate token for reset password url : ${err}`
    })
  }
}

// resetpassword - getting user based on token ,hash & update password
exports.resetPassword = async(req,res)=>{
  try{
   console.log("server reset password aa gye..")
    // fetch data
    const {newPassword,confirmNewPassword,token} = req.body;
    console.log("Data fetched ..")
    // validate passwords
    if(newPassword!==confirmNewPassword){
      return res.status(400).json({
        success:false,
        message:"New Password and Confirm Password are not matching"
      })
    }
    console.log("password matched..")
    // check user in db using token
    const user = await User.findOne({token:token});
    if(!user){
      return res.status(400).json({
        success:false,
        message:"Invalid token , so such user exist"
      })
    }
    console.log("user checkedd..")
    // check token time 
    if(user.resetPasswordExpires < Date.now()){
      return res.status(403).json({
        success:false,
        message:"Token expired , please regenerate token to reset password"
      })
    }
    console.log("valid tokennn..")

    // hash pwd
    const hashedPassword = await bcrypt.hash(newPassword,10);
    console.log("password hashed..")
    // update pwd of user in db
    const updatedUser = await User.findByIdAndUpdate({_id:user._id},
                              {
                              $set: 
                              {
                                password:hashedPassword
                              }
                              },
                              {new:true}
                              )
      console.log("user created ")
      // return response

    return res.status(200).json({
      success:true,
      message:"Password Reset is Successfull",
      updatedUser
    })

  }catch(err){
    console.log(err)
    return res.status(500).json({
      success:false,
      messge:"Something went wrong while Reseting Password"
    })
  }
}