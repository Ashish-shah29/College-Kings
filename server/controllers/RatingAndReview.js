const RatingAndReview = require('../models/RatingAndReview')
const Course = require('../models/Course')

// create rating and review

exports.createRatingAndReview = async (req, res) => {
  try {
    // fetch data 
    const { courseId, rating, review } = req.body
    // fetch user
    console.log("REQ BODY : ", req.body)
    const userId = req.user.id;

    // valid courseId
    if (!courseId || !rating || !review) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the details"
      })
    }
    //find course & user enrolled hona chahiye in the course
    const courseDetails = await Course.findOne({
      _id: courseId,
      studentsEnrolled: userId
    });
    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "Student is not enrolled in the course"
      })
    }
    // ek hi baar review de skta hai then update hoga bhle hi baad me
    //check if user already reviewed the course
    const alreadyReviewed = await RatingAndReview.findOne({
      user: userId,
      course: courseId,
    });
    if (alreadyReviewed) {
      return res.status(403).json({
        success: false,
        message: 'Course is already reviewed by the user',
      });
    }
    // store in R&R
    const ratingAndreview = await RatingAndReview.create({
      user: userId,
      rating,
      review,
      course: courseId
    })
    // update course ka rating and review wala array with R&R ID
    const updatedCourse = await Course.findByIdAndUpdate(
      { _id: courseId },
      {
        $push: { ratingAndReview: ratingAndreview._id }
      }
    )
    // return res
    return res.status(200).json({
      success: true,
      message: "Rating And Review Uploaded Successfully",
      ratingAndreview
    })
  } catch (err) {
    console.log(err.message)
    return res.status(500).json({
      success: false,
      message: `Something went wrong while CREATING RATING AND REVIEW : ${err}`
    })
  }
}

// get average rating of a course

exports.getAverageRating = async (req, res) => {
  try {
    // get course ID
    const courseId = req.body.courseId;
    // validate ID
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Please provide course ID"
      })
    }
    // check if course exist or not
    const courseDetails = await Course.findOne({ _id: courseId })
    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: "Could not Find Course with given ID"
      })
    }
    // calculate average rating 
    const result = await RatingAndReview.aggregate([
      {
        $match:
        {
          course: new mongoose.Types.ObjectId(courseId)
        }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" }
        }
      }
    ])
    // return response
    // if rating exist atleast one
    if (result.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Average Rating Calculated Successfully",
        averageRating: result[0].averageRating
      })
    }
    // if no rating exist
    return res.status(200).json({
      success: true,
      message: "No Rating Given till Now",
      averageRating: 0
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while CALCULATING AVERAGE RATING OF A COURSE"
    })
  }
}

// get all reviews that exist - sb k sb no criterai

exports.getAllReviews = async (req, res) => {
  try {
    const allReviews = await RatingAndReview.find({})
      .populate({
        path: "course",
        select: "courseName"
      })
      .populate({
        path: "user",
        select: "firstName lastName email image"
      });
    return res.status(200).json({
      success: true,
      message: "All Reviews Fetched Successfully",
      allReviews
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while FETCHING ALL REVIEWS"
    })
  }
}

