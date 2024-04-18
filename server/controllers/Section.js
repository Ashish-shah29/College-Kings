const Section = require('../models/Section')
const SubSection = require('../models/SubSection')
const Course = require('../models/Course')

exports.createSection = async(req,res)=>{
  try{
    // fetch data
    const {sectionName,courseId} = req.body;
    // validate data
    if(!sectionName || !courseId){
      return res.status(400).json({
        success:false,
        message:"Please fill Section Name"
      })
    }
    // create section 
    const newSection = await Section.create({name:sectionName})
    // insert section into course
    const updatedCourse = await Course.findByIdAndUpdate(
                     {_id:courseId},
                     {$push:{courseContent:newSection._id}},
                     {new:true})
                     .populate({
                      path:'courseContent',
                      populate:{
                        path:'subSections'
                      }
                     }).exec()
    // return response
    return res.status(200).json({
      success:true,
      message:"SECTION CREATED successfully",
      data:updatedCourse
    })

  }catch(err){
    return res.status(500).json({
      success:false,
      message:"Something went wrong while CREATING SECTION"
    })

  }
}
// update section - naam update kr rhe h aur kuch nhi, baki sub-section me krenge
exports.updateSection = async(req,res)=>{
  try{
    //fetch data
    const {sectionName,sectionId,courseId} = req.body;
    console.log("REQ BODY : ",req.body)
    const newName = sectionName;
    // validate data
    if(!newName || !sectionId){
      return res.status(400).json({
        success:false,
        message:"Please fill all the details"
      })
    }
    // update section 
    const updatedSection = await Section.findByIdAndUpdate(
                               {_id:sectionId},
                               {name:newName},
                               {new:true}
    )
    // update course
    const updatedCourse = await Course.findByIdAndUpdate(
                        {_id:courseId},
                        {new:true}
                      ).populate({
                        path:"courseContent",
                        populate:{
                          path:"subSections"
                        }
                      }).exec()
    // return response 
    return res.status(200).json({
      success:true,
      message:"SECTION UPDATED successfully",
      data:updatedCourse
    })
  }catch(err){
    return res.status(500).json({
      success:false,
      message:"Something went wrong while UPDATING SECTION"
    })
  }
}

// delete section - course me se section delete nhi kiya & subsection model se subsection delete nhi kiye , only deleted Section as normal . why?? - answer in testing

exports.deleteSection  = async(req,res)=>{
  try{
    //fetch ID  - url params me se fetching..
    const {sectionId,courseId}= req.body

    const updatedCourse = await Course.findByIdAndUpdate({_id:courseId},{
      $pull:{
        courseContent:sectionId
      }
    },{new:true}).populate({
      path:"courseContent",
      populate:{
        path:"subSections"
      }
    }).exec();

    const section = await Section.findById(sectionId);
		console.log(sectionId);
		if(!section) {
			return res.status(404).json({
				success:false,
				message:"Section not Found",
			})
		}
   // delete sub sections in the section 
   await SubSection.deleteMany({_id:{$in: section.subSections}})
   // delete section
   await Section.findByIdAndDelete({_id:sectionId})
    // return res
    return res.status(200).json({
      success:true,
      message:"SECTION DELETED successfully",
      data:updatedCourse
    })
  }catch(err){
    return res.status(500).json({
      success:false,
      message:"Something went wrong while DELETING SECTION"
    })
  }
}