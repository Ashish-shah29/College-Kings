const mongoose = require('mongoose')
const {mailSender} = require('../utils/mailSender')
const otpMailTemplate = require('../mail/templates/emailVerificationMail')
const OTPSchema = new mongoose.Schema({
  email:{
    type:String,
    require:true
  },
  otp:{
    type:String,
  },
  createdAt:{
    type:Date,
    default:Date.now(),
    expires: "5*60"
  }
})
// function to send verification mail
const sendVerificationEmail = async(email,otp)=>{
  try{
    const mailResponse = await mailSender(
      email
      ,"Verification Mail from Ashish"
      ,otpMailTemplate(otp))
    console.log("Email Sent Successfully ",mailResponse)
  }catch(err){
    console.log("In OTP PREE...error occured while sending email ",err.message)
  }
}
//  middlewares
OTPSchema.pre("save",async function(next){
  // Only send an email when a new document is created

     await sendVerificationEmail(this.email,this.otp)
  next();
})

module.exports = mongoose.model("OTP",OTPSchema)