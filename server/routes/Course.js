const express = require('express')
const router = express.Router();

// import constrollers
// course controllers
const {createCourse,
  getCourseDetails, 
  showAllCourses, 
  getFullCourseDetails,
  editCourse,
  getInstructorCourses,
  deleteCourse,} = require('../controllers/Course')
//section controllers
const {createSection,updateSection,deleteSection} = require('../controllers/Section')
// sub section controllers
const {createSubSection, updateSubSection, deleteSubSection} = require('../controllers/SubSection')
// Rating and Review controllers
const {createRatingAndReview,getAllReviews,getAverageRating} = require('../controllers/RatingAndReview')
// Category controllers
const {createCategory,showAllCategories,getCategoryPageDetails} = require('../controllers/Category')

// course progress controllers
const {
  updateCourseProgress
} = require("../controllers/CourseProgress");

// middlewares
const {auth, isStudent,isAdmin,isInstructor} = require('../middlewares/auth')




//**************************************************************************
//************************CourseRoutes*************************************
// course 
router.post('/course/createCourse',auth,isInstructor,createCourse)
router.get('/course/getAllCourses',showAllCourses)
router.post('/course/getCourseDetails',getCourseDetails)
// Rating n Review
router.post('/course/createRating',auth,isStudent,createRatingAndReview)
router.get('/getAverageRating',getAverageRating)
router.get('/course/getReviews',getAllReviews)
// section
router.post("/course/addSection",auth,isInstructor,createSection)
router.put('/course/updateSection',auth,isInstructor,updateSection)
router.delete('/course/deleteSection', auth,isInstructor,deleteSection)
// sub section
router.post('/course/addSubSection', auth, isInstructor,createSubSection)
router.put('/course/updateSubSection',auth,isInstructor,updateSubSection)
router.delete('/course/deleteSubSection',auth,isInstructor,deleteSubSection)
// category
router.post('/createCategory',auth,isAdmin,createCategory)
router.get('/course/showAllCategories',showAllCategories)
router.post('/course/getCategoryPageDetails',getCategoryPageDetails)

// ******************baki routes are pending.......***********************
// course baki k 
router.post("/course/getFullCourseDetails", auth, getFullCourseDetails)
router.post("/course/editCourse", auth, isInstructor, editCourse)
router.get("/course/getInstructorCourses", auth, isInstructor, getInstructorCourses)
// Delete a Course
router.delete("/course/deleteCourse", deleteCourse)
// course progress
router.post("/course/updateCourseProgress", auth, isStudent, updateCourseProgress);

// export router
module.exports = router;