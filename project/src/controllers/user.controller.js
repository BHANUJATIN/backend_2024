import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js"; 

const registerUser = asyncHandler( async (req, res) => {
    // take data from req
    // validation - not empty
    // check if user already exist: username, email
    // check for images, avatar
    // upload them to cloudnary, avatar
    // create user object - save user on the database
    // remove password and refresh token from response
    // check for user creation
    // return res
 

    const {fullName, email, username, password } = req.body;
    console.log({email, password});

    if(
        [fullName, email, username, password].some((field) => 
            field?.trim() === ""
        )
    ){
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = User.findOne({
        $or: [{ username} , { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User already exists")
    }
    console.log(req.files);
    console.log(req.body);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImgLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required! ");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImgLocalPath);

    if(!avatar){
        throw new ApiError(400, "Avatar file is required! ");
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase(),

    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "It's not you it's us, while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully")
    )
})

export {registerUser};