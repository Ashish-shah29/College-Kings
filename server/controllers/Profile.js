const Profile = require("../models/Profile")
const User = require('../models/User')
const Course = require('../models/Course')
const CourseProgress = require('../models/CourseProgress')
const {uploadImageToCloudinary} = require('../utils/imageUploader')
const {convertSecondsToDuration} = require('../utils/secondsToDuration')
require('dotenv').config()

exports.updateProfile = async (req, res) => {
  try {
    const {
      firstName = "",
      lastName = "",
      dateOfBirth = "",
      about = "",
      contactNumber = "",
      gender = "",
    } = req.body
    const id = req.user.id

    // Find the profile by id
    const userDetails = await User.findById(id)
    const profile = await Profile.findById(userDetails.additionalDetails)

    const user = await User.findByIdAndUpdate(id, {
      firstName,
      lastName,
    })
    await user.save()

    // Update the profile fields
    profile.dateOfBirth = dateOfBirth
    profile.about = about
    profile.contactNumber = contactNumber
    profile.gender = gender

    // Save the updated profile
    await profile.save()

    // Find the updated user details
    const updatedUserDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec()

    return res.json({
      success: true,
      message: "Profile updated successfully",
      updatedUserDetails,
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

// delete account 
exports.deleteAccount = async(req,res)=>{
  try{
    // fetch user id - auth middleware ne req me add ki hai
    const userId = req.user.id;
    // find profile id 
    const user = await User.findById({_id:userId});
    const profileId = user.additionalDetails;
    // delete profile
    await Profile.findByIdAndDelete({_id:profileId})

    //HW: isko waps check karenge
    //if user is student - remove user from all the enrolled courses 
    if(user.accountType == "Student"){
    const courses = user.courses;
     courses.map( async(index,courseId) => {
      let key = index;
      await Course.findByIdAndUpdate(
          {_id:courseId},
          {
            $pull:{studentsEnrolled:userId}
          },
          {new:true}
      )
    })
  }
    // delete user 
    await User.findByIdAndDelete({_id:userId})

    await CourseProgress.findByIdAndDelete({_id:userId})
    // return response
    return res.status(200).json({
      success:true,
      message:"ACCOUNT DELETED successfully"
    })
    
  }catch(err){
    return res.status(500).json({
      success:false,
      message:`Something went wrong while DELETING PROFILE ${err}`      
    })
  }
}

// get all users
exports.getAllUserDetails = async(req,res)=>{
  try{
    // get user id 
    const userId = req.user.id;

    // find user details
    const userDetails = await User.find({_id:userId}).populate("additionalDetails").exec();

    // return response
    return res.status(200).json({
      success:true,
      data:userDetails,
      message:"User Details Fetched Successfully"
    })
    }catch(err){
    return res.status(500).json({
      success:false,
      message:"Something went wrong while fetching USER DETAILS"
    })
  }
}

// exports.playPicture = async (req, res) => {
//   try {
//     const displayPicture = req.files.displayPicture
//     console.log(displayPicture)
//     console.log("display temp path : ",displayPicture.tempFilePath)

//     console.log("user id se pehle ")
//     const userId = req.user.id; 
//     console.log("id fetch kr liii")
//     const image = await uploadImageToCloudinary(
//       displayPicture,
//       process.env.FOLDER_NAME,
//       1000,
//       1000
//     )
//     console.log(image)
//     const updatedProfile = await User.findByIdAndUpdate(
//       { _id: userId },
//       { image: image.secure_url },
//       { new: true }
//     )
//    return res.send({
//       success: true,
//       message: `Image Updated successfully`,
//       data: updatedProfile,
//     })
//   } catch (error) {
//     console.log("error is profile controller : ",error)
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     })
//   }
// }

exports.updateDisplayPicture = async (req, res) => {
  try {
    const displayPicture = req.files.displayPicture
    const userId = req.user.id
    const file = displayPicture
    const folder = process.env.FOLDER_NAME
    const image = await uploadImageToCloudinary(
    { file,
     folder,
     height:1000,
     quality:1000
    }
    )
    console.log(image)
    const updatedProfile = await User.findByIdAndUpdate(
      { _id: userId },
      { image: image.secure_url },
      { new: true }
    )
    res.send({
      success: true,
      message: `Image Updated successfully`,
      data: updatedProfile,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id
    let userDetails = await User.findOne({
      _id: userId,
    })
      .populate({
        path: "courses",
        populate: {
          path: "courseContent",
          populate: {
            path: "subSections",
          },
        },
      })
      .exec()
    userDetails = userDetails.toObject()
    var SubsectionLength = 0
    for (var i = 0; i < userDetails.courses.length; i++) {
      let totalDurationInSeconds = 0
      SubsectionLength = 0
      for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
        totalDurationInSeconds += userDetails.courses[i].courseContent[
          j
        ].subSections.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
        // userDetails.courses[i].totalDuration = convertSecondsToDuration(
        //   totalDurationInSeconds
        // )
        SubsectionLength +=
          userDetails.courses[i].courseContent[j].subSections.length
      }
      userDetails.courses[i].totalDuration = convertSecondsToDuration(
        totalDurationInSeconds
      )
      let courseProgressCount = await CourseProgress.findOne({
        courseId: userDetails.courses[i]._id,
        userId: userId,
      })
      courseProgressCount = courseProgressCount?.completedVideos.length
      if (SubsectionLength === 0) {
        userDetails.courses[i].progressPercentage = 100
      } else {
        // To make it up to 2 decimal point
        const multiplier = Math.pow(10, 2)
        userDetails.courses[i].progressPercentage =
          Math.round(
            (courseProgressCount / SubsectionLength) * 100 * multiplier
          ) / multiplier
      }
    }

    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find user with id: ${userDetails}`,
      })
    }   
    console.log("USERDETAILS COURSES : ",userDetails.courses)
    return res.status(200).json({
      success: true,
      data: userDetails.courses,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.instructorDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const courseDetails = await Course.find({ instructor: userId })

    const courseData = courseDetails.map((course) => {
      const totalStudentsEnrolled = course.studentsEnrolled.length
      const totalAmountGenerated = totalStudentsEnrolled * course.price

      // Create a new object with the additional fields
      const courseDataWithStats = {
        _id: course._id,
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        // Include other course properties as needed
        totalStudentsEnrolled,
        totalAmountGenerated,
      }
      return courseDataWithStats
    })
    console.log("COURSE DATA : ",courseData)

   return res.status(200).json({success:true, courses: courseData })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}