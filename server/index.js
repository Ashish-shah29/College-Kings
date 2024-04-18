const express = require('express')
const app = express();
// to load process obj
require('dotenv').config()
// to fetch files from req
const fileUpload = require('express-fileupload')
// to parse cookies
const cookieParser = require('cookie-parser')
const cors = require('cors')
const {dbConnect} = require('./config/database')
const {cloudinaryConnect} = require('./config/cloudinary')
// import routes
const contact = require('./routes/Contact') 
const course = require('./routes/Course')
const payments = require('./routes/Payments')
const profile = require('./routes/Profile')
const user = require('./routes/User')

// use middlewares
app.use(express.json())
app.use(cookieParser())

app.use(fileUpload({
  useTempFiles : true,
  tempFileDir : '/tmp'
}));
app.use(
	cors({
		origin:"https://study-notion-frontend-kappa-woad.vercel.app/",
		credentials:true,
	})
)


const PORT = process.env.PORT || 4000;

// mount routes in my root directory of study notion
app.use('/studynotion/v1',contact)
app.use('/studynotion/v1',course)
app.use('/studynotion/v1',payments)
app.use('/studynotion/v1',profile)
app.use('/studynotion/v1',user)

// connect db and cloudinary
dbConnect()
cloudinaryConnect();

// server listening events at PORT : unique address of my application on the local machine
app.listen(PORT,(req,res)=>{
  console.log(`Server is successfully listening at PORT : ${PORT}`)
})

// default route
app.get("/", (req, res) => {
	return res.send(`<h2>This is default route of study notion</h2>`)
});
