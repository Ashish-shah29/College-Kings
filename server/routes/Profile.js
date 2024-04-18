const express = require('express')
const router = express.Router()

// import controllers
const { updateProfile,
  deleteAccount,
  getAllUserDetails,
  updateDisplayPicture,
  getEnrolledCourses,
  instructorDashboard,
  } = require('../controllers/Profile')

// import middlewares
const { auth,isInstructor } = require('../middlewares/auth')

// create routes
router.put('/profile/updateProfile',auth,updateProfile)
router.delete('/profile/deleteProfile',auth,deleteAccount)
router.get('/profile/getUserDetails',auth,getAllUserDetails)

// ******************baki routes are pending.......***********************

// Get Enrolled Courses
router.get("/profile/getEnrolledCourses", auth, getEnrolledCourses)
router.put("/profile/updateDisplayPicture", auth, updateDisplayPicture)
router.get("/profile/instructorDashboard", auth, isInstructor, instructorDashboard)

// export router
module.exports = router;