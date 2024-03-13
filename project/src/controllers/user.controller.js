import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import fs from "fs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    console.log(accessToken, refreshToken);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generating referesh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // take data from req
  // validation - not empty
  // check if user already exist: username, email
  // check for images, avatar
  // upload them to cloudnary, avatar
  // create user object - save user on the database
  // remove password and refresh token from response
  // check for user creation
  // return res

  const { fullName, email, username, password } = req.body;
  console.log({ email, password });

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  console.log(req.files);
  console.log(req.body);

  // const coverImgLocalPath = req.files?.coverImage[0]?.path;

  let avatarLocalPath = null;
  if (
    req.files &&
    Array.isArray(req.files.avatar) &&
    req.files.avatar.length > 0
  ) {
    avatarLocalPath = req.files.avatar[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required! ");
  }

  let coverImgLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImgLocalPath = req.files.coverImage[0].path;
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    if (avatarLocalPath) {
      fs.unlinkSync(avatarLocalPath);
    }
    if (coverImgLocalPath) {
      fs.unlinkSync(coverImgLocalPath);
    }
    throw new ApiError(409, "User already exists");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImgLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required! ");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "It's not you it's us, while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // data from req
  // email or username based access
  // find the user
  // check password
  // access and referesh token
  // send cookies
  // send response

  const { username, email, password } = req.body;
  console.log({ username, email, password });

  if (!email) {
    throw new ApiError(400, "email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "user does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(404, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id
  );

  // what info you want to send to the user
  // there are some field should not be sent

  // we are making one more call to database to update user with new details;

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // When u are sending cookies to user this option field
  // is required to set
  const options = {
    httpOnly: true, // this made cookie modifiable only on server not by client
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In successfully"
      )
    );
});

const logOutUser = asyncHandler(async (req, res) => {
  // now here we can not ask user for email
  // he can loggedout anyone user
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { refreshToken: 1 },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true, // this made cookie modifiable only on server not by client
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "invalid refresh token");
    }

    if (user?.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { newAccessToken, newRefreshToken } =
      await generateAccessAndRefereshTokens(user._id);
    return res
      .status(200)
      .cookie("accessToken", newAccessToken)
      .cookie("refreshToken", newRefreshToken)
      .json(
        new ApiResponse(
          200,
          {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          },
          "Access token refresh success"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(200, req.user, "current user fetch success");
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || email) {
    throw new ApiError(400, "all field are required");
  }

  const user = User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    { new: true } //return updated information
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details update success"));

  // best practice to make different controller for image update
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar file is missing");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar) {
    throw new ApiError(400, "error while uploading on avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(400, user, "avatar Image update success"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "cover image file is missing");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage) {
    throw new ApiError(400, "error while uploading on avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(400, user, "Cover Image update success"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "username is missing");
  }

  // mongodb aggregate pipeline
  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers"
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo"
        },
        isSubscribed:{
          $cond: {
            if: {$in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false
          }
        }
      }
    },
    {
        $project: {
          fullName: 1,
          username: 1,
          channelsSubscribedToCount: 1,
          subscribersCount: 1,
          isSubscribed:1,
          avatar:1,
          coverImage:1,
          email:1,
        }
    }
  ]);

  if(!channel?.length){
    throw new ApiError(404, "channel does not exists")
  }
  console.log(channel);

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "user channel fetched successfully")
    )
});


const getWatchHistory = asyncHandler( async (req, res) => {
  // mongoose convert mongodb _id string to objectId('abc123')
  const user = await User.aggregate([
    {
      // in aggregation pipeline mongoose does not manipulate it , it directly goes as it is.
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline:[
          {
            $lookup:{
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1
                  }
                }
              ]
            }
          },
          {
            $addFields:{
              owner:{
                $first: "$owner"
              }
            }
          }
        ]
      }
    }
  ])

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user,
        "Watch history fetched successfully"
      )
    )
})

export {
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserCoverImage,
  updateUserAvatar,
  getUserChannelProfile,
  getWatchHistory,
};
