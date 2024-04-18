// import mongoose
const mongoose = require('mongoose')
require('dotenv').config();
// create & export dbconnect
exports.dbConnect = async(req,res)=>{
    mongoose.connect(process.env.DATABASE_URL)
    .then(()=>{console.log("DB CONNECTED SUCCESSFULLY")})
    .catch((err)=>{
      console.log("DB CONNECTION FAILED ",err.message);
      process.exit(1);
    })
}
