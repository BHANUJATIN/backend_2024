import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs'


const uploadOnCloudinary = async (localFilePath) => {
    try{
        if(!localFilePath) {
            console.error("no localfilePath provided to upload the file ")
            return null;
        }
        // upload on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        console.log("file is uploaded on cloudinary", response.url);
        return response;

    } catch(error){
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file
    }
}

          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET, 
});

export {uploadOnCloudinary};
