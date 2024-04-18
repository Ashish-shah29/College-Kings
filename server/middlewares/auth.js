const jwt = require('jsonwebtoken')
const User = require('../models/User')
require('dotenv').config()

// auth
exports.auth = async(req,res,next)=>{
  try{
    // extract token
    const token = req.body.token || req.cookies.token || req.header('Authorization').replace("Bearer ","");
    // validate token
    if(!token){
      return res.status(400).json({
        success:false,
        message:"Token Not Found"
      })
    }
    // verify token
    try {
			// Verifying the JWT using the secret key stored in environment variables
			const payload = jwt.verify(token, process.env.JWT_SECRET);
			console.log(payload);
			// Storing the decoded JWT payload in the request object for further use
			req.user = payload;
		} catch (error) {
			// If JWT verification fails, return 401 Unauthorized response
			return res
				.status(401)
				.json({ success: false, message: "token is invalid" });
		}
    next();

  }catch(err){
    return res.status(403).json({
      success:false,
      message:"Not an Authenticated User"
    })
  }
}
// authz
// isStudent
exports.isStudent = (req,res,next)=>{
 try{
    if(req.user.accountType !== "Student"){
      return res.status(403).json({
        success:false,
        message:"Sorry, This is a protected route for students only. "
      })
    }
    next();
 }catch(err){
  return res.status(500).json({
    success:false,
    message:"Something went wrong while authorizing user"
  })

 }
}

// isInstructor
exports.isInstructor = (req,res,next)=>{
  try{
     if(req.user.accountType !== "Instructor"){
       return res.status(403).json({
         success:false,
         message:"Sorry, This is a protected route for Instructors only. "
       })
     }
     next();
  }catch(err){
   return res.status(500).json({
     success:false,
     message:"Something went wrong while authorizing user"
   })
 
  }
 }

// isAdmin
exports.isAdmin = (req,res,next)=>{
  try{
     if(req.user.accountType !== "Admin"){
       return res.status(403).json({
         success:false,
         message:"Sorry, This is a protected route for Admin only. "
       })
     }
     next();
  }catch(err){
   return res.status(500).json({
     success:false,
     message:"Something went wrong while authorizing user"
   })
 
  }
 }