const  mongoose = require('mongoose');
const { instance } = require('../config/razorpay')
const Course = require('../models/Course')
const User = require('../models/User')
const {courseEnrollmentEmail} = require('../mail/templates/courseEnrollmentMail')
const {mailSender} = require('../utils/mailSender');
const CourseProgress = require('../models/CourseProgress');
const { paymentSuccessEmail } = require('../mail/templates/paymentSuccessEmail');
const crypto = require('crypto')
require('dotenv').config()

exports.capturePayment = async(req,res)=>{
  // fetch
    const {courses} = req.body
    const userId = req.user.id;
  // validate 
  if(courses.length ===0){
    return res.status(404).json({
      success:false,
      message:"Please provide atleast one course"
    })
  }
  // total amount
  let totalAmount=0 ;
  // loop me validate and totalamount
  for(let course_id of courses){
    let course;
    try{
      course = await Course.findById(course_id);
      if(!course){
        return res.status(500).json({success:false,message:"Course not found"})
      }
      const uid = new mongoose.Schema.Types.ObjectId(userId)
      if(course.studentsEnrolled.includes(uid)){
        return res.status(500).json({success:false,message:"Student already enrolled in the course"})
      }
      console.log("COURSE PRICE : ",course?.price)
      totalAmount += course?.price
    }catch(err){
      console.log(err)
      return res.status(500).json({
        success:false,
        message:err.message
      })
    }
  }
  // order options
  console.log("Total amount : ",totalAmount)
  const options = {
    amount: totalAmount*100,
    currency: "INR",
    receipt:Math.random(Date.now()).toString(),
    notes:{
      userId:userId
    }
  }
  console.log("OPTIONS CREATED : ",options)
  // create order
  try{
    const paymentResponse = await instance.orders.create(options);
    console.log("ORDER CREATEDD.....",paymentResponse)
    // res
    return res.status(200).json({
      success:true, 
      message:"Payment initiated successfully",
      data:paymentResponse,
    })
    
  }catch(err){
    console.log(err)
    return res.status(500).json({
      success:false,
      message:`Could not initiate Payment : ${err}`
    })
  }
}

exports.verfiyPayment = async(req,res)=>{
  const razorpay_order_id = req.body?.razorpay_order_id;
  const razorpay_payment_id = req.body?.razorpay_payment_id;
  const razorpay_signature = req.body?.razorpay_signature;
  const {courses} = req.body;
  const userId = req.user.id;

  if(!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courses || !userId){
    return res.status(404).json({success:false,message:"Please provide all the details"})
  }
  const body = razorpay_order_id + '|' + razorpay_payment_id
  const expectedSignature = crypto
  .createHmac('sha256', process.env.RAZORPAY_SECRET)
  .update(body.toString())
  .digest('hex');
   
  if(expectedSignature === razorpay_signature){
    await enrollStudent(courses,userId,res);
   return res.status(200).json({
      success:true,
      message:"Payment Verified"
    })
  }
  else{
    return res.status(500).json({success:false,message:"Payment Failed"})
  }
}
const enrollStudent = async(courses,userId,res)=>{
  if(!courses || !userId){
    return res.status(500).json({
      success:false,
      message:"Please provide both courses and user id"
    })
  }
  for(const courseId of courses){
    try{
      // enroll student into course
      const enrolledCourse = await Course.findByIdAndUpdate(
        {_id:courseId},
        {
          $push:{studentsEnrolled:userId}
        },
        {new:true}
        )

        if(!enrolledCourse){
          return res.status(500).json({success:false,message:"Course not found"})
        }
        console.log("COURSE UPDATE DONE : ",enrolledCourse)
        // create progress record for this student's course
        const courseProgress = await CourseProgress.create({
          courseId:courseId,
          userId:userId,
          completedVideos:[]
        })
        console.log("COURSE PROGRESS DONE : ",courseProgress)
        // add course to student 
        const enrolledStudent = await User.findByIdAndUpdate(
          {_id:userId},
          {
            $push:{
              courses:courseId,
              courseProgress:courseProgress._id
            }
          },
          {new:true}
        )
        if(!enrolledStudent){
          return res.status(500).json({success:false,message:"student not found"})
        }
        console.log("STUDENT ENROLLED DONE : ",enrolledStudent)
        // send mail to student 
        const mailResponse = await mailSender(
          enrolledStudent.email,
          `Successfully Enrolled into ${enrolledCourse.courseName}`,
           courseEnrollmentEmail(enrolledCourse.courseName,`${enrolledStudent.firstName+" "+ enrolledStudent.lastName }`)
        )
        console.log("MAIL SEND DONE : ",mailResponse)
    }catch(err){
      console.log(err)
      return res.status(500).json({
        success:false,
        message:"Could not enroll student"
      })
    }
  }
}

exports.sendPaymentSuccessMail = async(req,res)=>{
  const {order_id,payment_id,amount} = req.body;
  const userId = req.user.id;
  console.log("user id : ",userId)
  if(!order_id || !payment_id || !amount || !userId){
    return res.status(500).json({
      success:false,
      message:"Please Provide all the details"
    })
  }
  try{
    // const uid = new mongoose.Schema.Types.ObjectId(userId)
    const enrolledStudent = await User.findById({_id:userId})
    // console.log("ENROLLED STUDENT : ",enrolledStudent)
    if(!enrolledStudent){
      return res.status(500).json({
        success:false,
        message:"User not found"
      })
    }
    // console.log("USER EMAIL : ",enrolledStudent.email)
    const mailResponse = await mailSender(
      enrolledStudent?.email,
      `Payment Successfull`,
      paymentSuccessEmail(enrolledStudent.firstName,amount,order_id,payment_id)
    )
    // console.log("MAIL RESPONSE : ",mailResponse)
  }catch(err){
    console.log(err)
    return res.status(500).json({
      success:false,
      message:`Error occured while sending payment mail : ${err.message
      }`
    })
    
  }
}
// exports.createPayment = async (req, res) => {
//   // fetch courseId and userId
//   try {
//     const { course_id } = req.body;
//     const userId = req.user.id;

//     // validate courseId
//     if (!course_id) {
//       return res.status(400).json({
//         success: false,
//         message: "Please provide a valid course ID"
//       })
//     }

//     // validate courseDetails
//     const courseDetails = await Course.findById(course_id);
//     if (!courseDetails) {
//       return res.status(400).json({
//         success: false,
//         message: "Can't find course Details"
//       })
//     }

//     // check if user has already paid for the same course
//     const uid = mongoose.Types.ObjectId(userId);
//     if (courseDetails.studentsEnrolled.includes(uid)) {
//       return res.status(403).json({
//         success: false,
//         message: "Student already Enrolled"
//       })
//     }
//     // create order
//     const amount = courseDetails.price;
//     const currency = "INR";
//     const options = {
//       amount:amount,
//       currency:currency,
//       receipt: Math.random(Date.now()).toString(),
//       notes:{
//         courseId: course_id,
//         userId: userId
//       }
//     }
//     const paymentResponse =  instance.orders.create(options);
//     console.log(paymentResponse);
//     // res
//     return res.status(200).json({
//       success:true,
//       message:"Payment Initiated Successfully",
//       courseName:courseDetails.courseName,
//       courseDescription : courseDetails.courseDescription,
//       thumbnai:courseDetails.thumbnail,
//       order_id:paymentResponse.id,
//       currency:paymentResponse.currency,
//       amount: paymentResponse.amount
//     })
//   }
//   catch (err) {
//     console.log(err.message)
//     return res.status(500).json({
//       success: false,
//       message: `Cound not initiate payment ${err.message}`,
//     })
//   }
// }

// // verify signature of Razorpay and Server 
// exports.verfiySignature = async(req,res)=>{
//   // server ki signature
//   const webhookSecret = "12345678";

//   // razorpay ki bheji hui signature
//   const signature = req.headers["x-razorpay-signature"];

//   // server ki signature ko hash krenge to compare with Razorpay signature
//   const shasum = crypto.createHmac("sha256",webhookSecret);
//   shasum.update(JSON.stringify(req.body));
//   const digest = shasum.digest("hex");

//   // match both signature 
//   if(signature === digest){
//     console.log("Payment is Authorized")

//     // fulfill the actions
//     try{
//     // find course and enroll student into the course
//     const {courseId,userId} = req.body.payload.payment.entity.notes;
//     const enrollCourse = await Course.findByIdAndUpdate(
//                          {_id:courseId},
//                          {
//                           $push:{studentsEnrolled:userId}
//                          },
//                          {new:true}
//     )
//     if(!enrollCourse){
//       return res.status(400).json({
//         success:false,
//         message:"Course Not Found"
//       })
//     }
//     // add course in student(User) shema
//     const enrollStudent = await User.findByIdAndUpdate(
//                            {_id:userId},
//                            {$push:{courses:enrollCourse._id}},
//                            {new:true}
//     )
//     console.log(enrollStudent)
//     // send mail of congratulations
//     const emailResponse = await mailSender(
//                           enrollStudent.email,
//                           "congratulations from StudyNotion",
//                           `${courseEntrollmentMail}`
//     )
//     console.log(emailResponse)
//     // return res.
//     return res.status(200).json({
//       success:true,
//       message:"Signature Verified and Student Enrolled into Course"
//     })
//     }catch(err){
//       console.log(err.message)
//       return res.status(500).json({
//         success:false,
//         message:err.message
//       })
//     }
//   }else{
//     return res.status(500).json(
//       {
//         success:false,
//         message:"Invalid Signature"
//       }
//     )
//   }
// }
