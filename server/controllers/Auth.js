const User = require('../models/User')
const OTP = require('../models/OTP')
const otpGenerator = require('otp-generator')
const bcrypt = require('bcrypt')
const Profile = require('../models/Profile')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const {mailSender} = require('../utils/mailSender')
const { passwordUpdated } = require('../mail/templates/passwordUpdate')
// send otp 

exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    // find in db if user already exist
    const checkUserPresent = await User.findOne({ email: email })
    // if user already exist , then no need to register again
    if (checkUserPresent) {
      res.status(400).json({
        success: false,
        message: "User already exist, kindly logIn"
      })
    }
    //if it is new user, generate otp
    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false
    })
    // otp unique hona chahiye
    // check in db if otp already exist
    let result = await OTP.findOne({ otp: otp })

    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false
      })
      result = await OTP.findOne({ otp: otp })
    }
    console.log("OTP IS : ", otp)
    // unique otp mil gya hai, store in db
    const otpPayload = { email, otp }
    console.log("In Auth Controller.. OTP Create hone jaa rha hai")
    const otpStored = await OTP.create(otpPayload)
    res.status(200).json({
      success: true,
      data: otpStored,
      message: "OTP generated"
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Can't generete OTP"
    })
  }
}
// signUp
exports.signUp = async (req, res) => {
  try {
    // data fetch from req
    console.log("Sign up BD me aa gye jeee")
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      otp
    } = req.body;
    console.log("Data fetch kr liya")
    // validate krlo
    if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the details"
      })
    }
    
    // 2 passwords to match kr lo 
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "password and confirm password doesn't match"
      })
    }
    console.log("password verify ho gya")
    // check if user already exist
    const checkUserPresent = await User.findOne({ email: email })
    if (checkUserPresent) {
      return res.status(400).json({
        success: false,
        message: "User is already registered"
      })
    }
    // find the most recent otp for the user from db
    const recentOtp = await OTP.findOne({ email: email }).sort({ createdAt: -1 }).limit(1);// sort({createdAt:-1}) is sorting in descending order and limit(1) is ensuring the retrieval of only one doc so we are getting the most recent doc based on createdAt

    // otp match 
    if (recentOtp.length == 0) {
      return res.status(400).json({
        success: false,
        message: "OTP not Found"
      })
    } else if (otp !== recentOtp.otp) {
      return res.status(400).json({
        success: false,
        message: "OTP doesn't match "
      })
    }
    console.log("OTP verify ho gya")
    // password hash kr lo 
    const hashedPassword = await bcrypt.hash(password, 10);

    // entry create kr do 
    const profile = await Profile.create({
      gender: null,
      dateOfBirth: null,
      contactNumber: null,
      about: null
    })
    console.log("Profile obj bna liya")
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      confirmPassword,
      accountType,
      additionalDetails: profile._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
    })
    console.log("Entry create kr dii")
    // res de do
    res.status(200).json({ 
      success: true,
      message: "User is registered successfully",
      data: user
    })

  } catch (err) {
    res.status(500).json({
      success: false,
      message: `User can't registered : ${err}`
    })
  }
}

// logIn
exports.logIn = async (req, res) => {
  try {
    // fetch data from request
    const { email, password } = req.body;
    // validate data
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Please fill the the details and try again"
      })
    }

    // check if user exist in db
    const user = await User.findOne({ email: email }).populate('additionalDetails').exec();
    console.log('USER : ',user)
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User doesn't exist,please Sign up first"
      })
    }
    // check password
    if (await bcrypt.compare(password, user.password)) {
      // create token 
      const payload = {
        id: user._id,
        email: user.email,
        accountType: user.accountType
      }
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "24h"
      });
      user.token = token;
      user.password = undefined;

      // create & send cookie in res
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true
      }
      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: "User logged in SUCCESSFULLY"
      })
    } else {
      return res.status(500).json({
        success: false,
        message: "Incorrect Password, try again"
      })
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Can't logIn User ${err.message}`
    })
  }

}
// changePassword
exports.changePassword = async (req, res) => {
  try {
    // authenticate a valid user in auth middleware & get user id from there
    // fetch user,current password and new password,confirmNewPassword from req
    console.log("passwords pendinggg.....")
    const { password, newPassword} = req.body;
    console.log("password:",password)
    console.log("new pass : ",newPassword)
    console.log("passwords fetch kr liye...")
    const userId = req.user.id;
    console.log("user fetch kr liye ....")
    // req me user = payload hai ,payload = user.id,email and role hai , password nhi hai isliye user.id se pura user obj nikal rha hu and then usse password mil jae ga
    const currUser = await User.findById(userId )
    console.log("user : ",currUser)
    console.log("user mil gya") 
    if(!currUser){
      return res.json({
        success:false,
        message:"user nhi millaaaaa"
      })
    }
  console.log("passwords empty to nhi....")
    // validate data
    if (!password || !newPassword ) {
      return res.status(400).json({
        success: false,
        message: "Please all the fields"
      })
    }
    // check current password in DB
    let passwordMatched = await bcrypt.compare(password, currUser.password);
    console.log("pass matched : ",passwordMatched)
    if (passwordMatched) {

      //update new password in DB
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      console.log("hashed password : ",hashedNewPassword)
      const user = await User.findByIdAndUpdate({ _id: currUser._id },
         { password: hashedNewPassword},
         {new:true}
        )
        console.log("UPDATED USER : ",user)
      // send mail of successfull password update

     const mailRes =  await mailSender(user.email,
            "Password Updated",
           passwordUpdated(user.email,user.firstName))

     return res.status(200).json({
        success: true,
        message: "Password updated SUCCESSFULLY",
        data: user
      })
    } else {
      console.log("password match nhi huaaa....")
      return res.status(401).json({
        success: false,
        message: `Current Password does not match `
      })
    }

  } catch (err) {
    return res.status(500).json({
      success: false,
      messge: `Can't Change Password ${err} `
    })
  }
}