const cloudinary = require('cloudinary').v2

exports.uploadImageToCloudinary = async({file,folder,height,quality})=>{
  try{
    const options = {
      folder:folder,
      resource_type:"auto"
    }
    if(height){
      options.height = height;
    }

    if(quality){
      options.quality = quality;
    }
    console.log("INSIDE CLOUDINARY FN PRINTING FILE ",file)
    console.log("INSIDE CLOUDINARY FN PRINTING FOLDER ",folder)
    return await cloudinary.uploader.upload(file.tempFilePath, options);
  }catch(err){
    console.log("Something went wrong while upload file to cloudinary ",err.message)
  }
}