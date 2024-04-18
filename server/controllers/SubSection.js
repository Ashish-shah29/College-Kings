const SubSection = require('../models/SubSection')
const Section = require('../models/Section');
const { uploadImageToCloudinary } = require('../utils/imageUploader');
require('dotenv').config()
exports.createSubSection = async (req, res) => {
  try {
    // fetch data
    console.log("REQ BODY : ",req.body)
    const { sectionId, title, description } = req.body;
    // fetch video
    const video = req.files.video;
    console.log("VIDEO IN SERVER : ",video)
    // validate data
    if (!sectionId || !title || !description || !video) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the details"
      })
    }
    // upload video to cloudinary
    const file = video;
    const folder = process.env.FOLDER_NAME
    const uploadedVideo = await uploadImageToCloudinary({file,folder });
    // store subsection into db
    console.log("UPLOADED VIDEO FROM CLOUDINARY : ",uploadedVideo)
    const subsection = await SubSection.create({
      title,
      description,
      videoUrl: uploadedVideo.secure_url,
      timeDuration:uploadedVideo.duration
    })
    // update section with this sub section ObjectId
    const updatedSection = await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $push: { subSections: subsection._id }
      },
      { new: true }
    ).populate("subSections").exec();
    console.log(updatedSection)
    // return response
    return res.status(200).json({
      success: true,
      message: "SUBSECTION CREATED successfully",
      data:updatedSection
    })

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `something went wrong while CREATING SUBSECTION : ${err}`
    })
  }
}

// HW: update sub section
exports.updateSubSection = async (req, res) => {
  try {
    // fetch data
    console.log("REQ BODY : ",req.body)
    const {sectionId, subSectionId, title, description } = req.body;
    // fetch video
    const video = req.files?.video;
    // validate datas
    if (!sectionId && !subSectionId && !title && !description && !video) {
      return res.status(400).json({
        success: false,
        message: "Please fill atleast one detail"
      })
    }
    // validate sub section
    const subSection = await SubSection.findById({_id:subSectionId})
    if(!subSection){
      return res.status(400).json({
        success:false,
        message:"Sub Section does not exist"
      })
    }
    // upload video to cloudinary
    let uploadedVideo;
    if(video){
      const file = video;
      const folder = process.env.FOLDER_NAME
      uploadedVideo = await uploadImageToCloudinary({file,folder });
    }
    const updatedObj ={}
    if(title){
      updatedObj.title = title
    }
    if(description){
      updatedObj.description = description
    }
    if(uploadedVideo){
      updatedObj.videoUrl = uploadedVideo?.secure_url
    }
    // update in db
    console.log("cloudinary upload ho gya ")
    const updatedSubsection = await SubSection.findByIdAndUpdate(
                                      {_id:subSectionId},
                                      updatedObj,
                                      {new:true}
                                      )
    const updatedSection = await Section.findById(sectionId).populate(
      "subSections"
    ).exec()
    return res.status(200).json({
      success:true,
      message:"SUB SECTION UPDATED successfully",
      data:updatedSection
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Something went wrong while UPDATING SUB SECTION : ${err}`
    })
  }
}

//HW: delete sub section 
exports.deleteSubSection  = async(req,res)=>{
  try{
    //fetch ID  - url params me se fetching..
    const {subSectionId,sectionId}= req.body
    if(!subSectionId || !sectionId){
      return res.status(400).json({
        success:false,
        message:"Please provide a section & sub section ID"
      })
    }
    const updatedSection = await Section.findByIdAndUpdate(
                            {_id:sectionId},
                            {
                              $pull:{
                                subSections:subSectionId
                              }
                            },{new:true}).populate("subSections").exec();
    // delete section 
   const subSection = await SubSection.findByIdAndDelete({_id:subSectionId})

   if(!subSection){
    return res.status(400).json({
      success:false,
      message:"Please provide a valid sub section ID"
    })
   }
    // return res
    return res.status(200).json({
      success:true,
      message:"SUB SECTION DELETED successfully",
      data:updatedSection
    })
  }catch(err){
    return res.status(500).json({
      success:false,
      message:"Something went wrong while DELETING SUB SECTION"
    })
  }
}