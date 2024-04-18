const Course = require('../models/Course')
const User = require('../models/User')
const Category = require('../models/Category')
const CourseProgress = require('../models/CourseProgress')
const { uploadImageToCloudinary } = require('../utils/imageUploader')
const { convertSecondsToDuration } = require('../utils/secondsToDuration')
const Section = require('../models/Section')
const SubSection = require('../models/SubSection')
require('dotenv').config()

exports.createCourse = async(req,res)=>{
  try{
    // fetch data
    console.log("COURSE REQ BODY : ",req.body)
    const {courseName,courseDescription,price,whatYouWillLearn,category,_tags,_instructions} = req.body
    // fetch user from req jo auth middleware ne req me dala hai 
    const user = req.user;

    // fetch image
    const thumbnail = req.files.thumbnailImage;
    console.log("THUMBNAIL : ",thumbnail)
    // validate data
    const tags = JSON.parse(_tags)
    const instructions = JSON.parse(_instructions)

    if(!courseName || !courseDescription || !price || !whatYouWillLearn || !category || !_tags || !_instructions){
      return res.status(400).json({
        success:false,
        message:"Please fill all the details"
      })
    }
    // validate category
    const categoryDetails = await Category.findById({_id:category});
    if(!categoryDetails){
      return res.status(400).json({
        success:false,
        message:"Category Details Not Found"
      })
    }
    // get instructor details- koi jrurt nhi hai , already req me user.id available hai
    // const instructorDetails = await User.findById(req.user.id);
    // if(!instructorDetails){
    //   return res.status(400).json({
    //     success:false,
    //     message:"Instructor Details Not Found"
    //   })
    // }

    // upload to cloudinary
    const file = thumbnail;
    const folder = process.env.FOLDER_NAME;
    const thumbnailImage = await uploadImageToCloudinary({file,folder})

    // create course entry in db
    const newCourse = await Course.create({
      courseName,
      courseDescription,
      price,
      category:categoryDetails._id,
      instructor:user.id,
      thumbnail: thumbnailImage.secure_url,
      whatYouWillLearn,
      tags:tags,
      instructions:instructions
    })

    // add course to the user model 
    await User.findByIdAndUpdate({_id:user.id},
        {
          $push:{courses: newCourse._id}
        }
      )

    //add course to Category model
    await Category.findByIdAndUpdate(
        {_id:categoryDetails._id},
        {
          $push:{course: newCourse._id}
        }
    )
    // return response 
    return res.status(200).json({
      success:true,
      message:"Course Created Successfully",
      data : newCourse
    })

  }catch(err){
    return res.status(500).json({
      success:false,
      message:`Something went wrong while creating course: ${err}`
    })
  }
}

// get all courses
exports.showAllCourses = async(req,res)=>{
  try{
    const allCourses = await Course.find({},{
      courseName:true,
      courseDescription:true,
      price:true,
      studentsEnrolled:true,
      instructor:true,
      thumbnail:true
    }).populate("instructor").exec();
    return res.status(200).json({
      success:true,
      message:"Courses fetched Successfully"
    })
  }catch(err){
    return res.status(500).json({
      success:false,
      message:"Something went wrong while getting courses data"
    })
  }
}

// get course details

exports.getCourseDetails = async(req,res)=>{
  try{
    const {courseId} = req.body;
    if(!courseId){
      return res.status(400).json({
        success:false,
        message:"Please Provide course ID"
      })
    }
    const course = await Course.findById({_id:courseId}).populate(
                    {
                      path:"courseContent",
                      populate:{
                        path:'subSections'
                      }
                    }).populate({
                      path:"instructor",
                      populate:{
                        path:"additionalDetails"
                      }
                    })
                    .populate("ratingAndReview")
                    .populate("studentsEnrolled")
                    .populate("category")
                    .exec()
    if(!course){
      return res.status(400).json({
        success:false,
        message:"Please Provide a Valid COURSE ID"
      })
    }
    let totalDurationInSeconds = 0
    course.courseContent.forEach((content) => {
      content.subSections.forEach((subSection) => {
        console.log("TIME DURATION :: ",subSection.timeDuration)
        const timeDurationInSeconds =subSection.timeDuration ? parseInt(subSection.timeDuration) : 0
        totalDurationInSeconds += timeDurationInSeconds
      })
    })

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds)
    return res.status(200).json({
      success:true,
      message:"Course Details Fetched successfully",
      data:{
        course,
        totalDuration
      }
    })

  }catch(err){
    console.log(err.message)
    return res.status(500).json({
      success:false,
      message:`Something went wrong while Fetching Course Details : ${err}` 
    })
  }
}


exports.getFullCourseDetails = async (req, res) => {
  try {
    const {courseId} = req.body
    const userId = req.user.id
    const courseDetails = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReview")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSections",
        },
      })
      .exec()

    let courseProgressCount = await CourseProgress.findOne({
      courseId: courseId,
      userId: userId,
    })

    console.log("courseProgressCount : ", courseProgressCount)

    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      })
    }

    // if (courseDetails.status === "Draft") {
    //   return res.status(403).json({
    //     success: false,
    //     message: `Accessing a draft course is forbidden`,
    //   });
    // }

    let totalDurationInSeconds = 0
    courseDetails.courseContent.forEach((content) => {
      content.subSections.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration)
        totalDurationInSeconds += timeDurationInSeconds
      })
    })

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
        completedVideos: courseProgressCount?.completedVideos
          ? courseProgressCount?.completedVideos
          : [],
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error,
    })
  }
}

// Get a list of Course for a given Instructor
exports.getInstructorCourses = async (req, res) => {
  try {
    // Get the instructor ID from the authenticated user or request body
    const instructorId = req.user.id

    // Find all courses belonging to the instructor
    const instructorCourses = await Course.find({
      instructor: instructorId,
    })
    .populate({
      path: "courseContent",
      populate: {
        path: "subSections",
      },
    })
    .sort({ createdAt: -1 })
    .exec()
    let courses = [];
    instructorCourses.forEach((courseDetails)=>{
      let totalDurationInSeconds = 0
      courseDetails = courseDetails.toObject();
      courseDetails.courseContent.forEach((content) => {
        content.subSections.forEach((subSection) => {
          const timeDurationInSeconds = parseInt(subSection.timeDuration)
          totalDurationInSeconds += timeDurationInSeconds
        })
      })
      const totalDuration = convertSecondsToDuration(totalDurationInSeconds)
      courseDetails.duration = totalDuration
      courses.push(courseDetails);
    })
    // Return the instructor's courses
    res.status(200).json({
      success: true,
      data: courses,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve instructor courses",
      error: error.message,
    })
  }
}
// Delete the Course
exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.body

    // Find the course
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    // Unenroll students from the course
    const studentsEnrolled = course.studentsEnrolled
    for (const studentId of studentsEnrolled) {
      await User.findByIdAndUpdate(studentId, {
        $pull: { courses: courseId },
      })
    }

    // Delete sections and sub-sections
    const courseSections = course.courseContent
    for (const sectionId of courseSections) {
      // Delete sub-sections of the section
      const section = await Section.findById(sectionId)
      if (section) {
        const subSections = section.subSections
        for (const subSectionId of subSections) {
          await SubSection.findByIdAndDelete(subSectionId)
        }
      }

      // Delete the section
      await Section.findByIdAndDelete(sectionId)
    }

    // Delete the course
    await Course.findByIdAndDelete(courseId)

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Edit Course Details
exports.editCourse = async (req, res) => {
  try {
    const { courseId } = req.body
    const updates = req.body
    const course = await Course.findById(courseId)

    if (!course) {
      return res.status(404).json({ error: "Course not found" })
    }

    // If Thumbnail Image is found, update it
    if (req.files) {
      console.log("thumbnail update")
      const thumbnail = req.files.thumbnailImage
      const file = thumbnail
      const folder = process.env.FOLDER_NAME 
      const thumbnailImage = await uploadImageToCloudinary(
       { file,
        folder
      }
       )
      course.thumbnail = thumbnailImage.secure_url
    }

    // Update only the fields that are present in the request body
    for (const key in updates) {
      if (updates.hasOwnProperty(key)) {
        if (key === "tags" || key === "instructions") {
          course[key] = JSON.parse(updates[key])
        } else {
          course[key] = updates[key]
        }
      }
    }

    await course.save()

    const updatedCourse = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReview")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSections",
        },
      })
      .exec()

    res.json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}