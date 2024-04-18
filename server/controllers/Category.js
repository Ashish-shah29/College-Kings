const Category = require('../models/Category')
const Course = require('../models/Course')
function getRandomInt(max) {
  return Math.floor(Math.random() * max)
}
exports.createCategory = async(req,res)=>{
  try{
    // fetch data
    const {name,description} = req.body;
    if(!name || !description){
      return res.status(400).json({
        success:false,
        message:"Please fill all the details"
      })
    }
    // create category
    const category = await Category.create({
      name:name,
      description:description
    })
    console.log(category)
    return res.status(200).json({
      success:true,
      message:"Tag created Successfully",
      category:category
    })
  }catch(err){
    return res.status(500).json({
      success:false,
      message:"Something went wrong while setting TAG"
    })
  }
}

// get all categories 
exports.showAllCategories = async(req,res)=>{
  try{
    const allCategories = await Category.find({},{name:true,description:true});
    return res.status(200).json({
      success:true,
      data : allCategories,
      message:"All Tags Fetched Successfully"
    })
    }catch(err){
    return res.status(500).json({
      success:false,
      message:`Something went wrong while setting TAG : ${err}`
    })
  }
}

// get category page details - jb user ek particular category k courses ko
// search krta hai , vo page

exports.getCategoryPageDetails = async(req,res)=>{
  try{
    // fetch category id
    const {categoryId} = req.body;
    console.log("REQ BODY : ",req.body)
    console.log("categoryId: ",categoryId)
    // fetch category data
    const selectedCategory = await Category.findById({_id:categoryId}).populate({
      path:"course",
      match:{status:"Published"},
      populate:"ratingAndReview",
    }).exec()
    console.log("SELECTED CATEGORY : ",selectedCategory)
    // validate data 
    if(!selectedCategory){
      return res.status(404).json({
        success:false,
        message:"Data Not Found"
      })
    }
    // Handle the case when there are no courses
    if (selectedCategory.course.length === 0) {
      console.log("No courses found for the selected category.")
      return res.status(404).json({
        success: false,
        message: "No courses found for the selected category.",
      })
    }
    // fetch different category courses
    const categoriesExceptSelected = await Category.find(
                                    {_id:{$ne:categoryId}});
      // ab different categories k array me se ek category nikal lo 

     let differentCategory = await Category.findOne(
        categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
          ._id
      ).populate({
        path:"course",
        match:{status:"Published"}
      }).exec()
      console.log("DIFFERENT CATEGORY : ",differentCategory)
    // fetch top seller courses
      const bestSellers = await Course.aggregate([
              {
                $addFields:{
                  studentsEnrolledSize :{ $size: "$studentsEnrolled" }
                }
              },
              {
                $sort:{studentsEnrolledSize:-1}
              }
      ]).limit(10)

      console.log("BEST SELLERS : ",bestSellers)
                         
    // return res
    return res.status(200).json({
      success:true,
      message:"Data of Category Page Fetched Successfully",
      data:{
        selectedCategory,
        differentCategory,
        bestSellers
      }
    })
  }catch(err){
    return res.status(500).json({
      success:false,
      message:`Something went wrong while FETCHING CATEGORY PAGE DETAILS : ${err}`
    })
  }
}
