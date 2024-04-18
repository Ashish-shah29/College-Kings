const express = require('express')
const router = express.Router()

// import controllers
const {capturePayment,verfiyPayment,sendPaymentSuccessMail} = require('../controllers/Payments')
// import middlewares
const { auth,isStudent } = require('../middlewares/auth')
// create routes
router.post('/payment/capturePayment',auth,isStudent,capturePayment)
router.post('/payment/verifyPayment',auth,isStudent,verfiyPayment)
router.post('/payment/sendPaymentSuccessEmail',auth,isStudent,sendPaymentSuccessMail)
// export router
module.exports = router;