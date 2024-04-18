const express = require('express')
const router = express.Router()

// import controllers
const {sendOTP,signUp,logIn,changePassword } = require('../controllers/Auth')
const {resetPassword,resetPasswordToken} = require('../controllers/ResetPassword')
// import middlewares
const {auth} = require('../middlewares/auth')
// create routes
console.log("Route file me aa gye..")
router.post('/auth/sendotp',sendOTP);
router.post('/auth/signup',signUp)
router.post('/auth/login',logIn)
router.put('/auth/changePassword',auth,changePassword)

router.post('/auth/reset-password-token',resetPasswordToken)
router.post('/auth/reset-password',resetPassword)
// export router
module.exports = router;