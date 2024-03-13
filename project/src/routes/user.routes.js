import { Router } from "express";
import {
  logOutUser,
  loginUser,
  registerUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
} from "../controllers/user.controller.js";

import { upload } from "../middlewares/multer.middleware.js";
import { VerifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

// secure routes
router.route("/logout").post(VerifyJWT, logOutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(VerifyJWT, changeCurrentPassword);
router.route("/current-user").get(VerifyJWT, getCurrentUser);
router.route("/update-account").patch(VerifyJWT, updateAccountDetails);
router
  .route("/avatar-update")
  .patch(VerifyJWT, upload.single("avatar"), updateUserAvatar);
router
  .route("/cover-image")
  .patch(VerifyJWT, upload.single("coverImage"), updateUserCoverImage);
router.route("/c/:username").get(VerifyJWT, getUserChannelProfile);
router.route("/watch-history").get(VerifyJWT, getWatchHistory);

export default router;
