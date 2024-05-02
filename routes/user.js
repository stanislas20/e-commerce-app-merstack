import express from "express"
import { changePassword, forgetPassword, getAllUserProfile, getMyProfile, getUserDetails, logOut, login, resetPassword, signup, updatePic, updateProfile, updateUserToAdmin} from "../controllers/user.js";
import {  isAdmin, isAuthenticated } from "../middlewares/auth.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router()

router.post("/login", login)

router.post("/new",singleUpload, signup)

router.get("/me", isAuthenticated, getMyProfile)
//get all users in the database
router.get("/all", isAuthenticated,isAdmin, getAllUserProfile)

router.get("/logout", isAuthenticated, logOut)

// updating Routes
router.put("/updateprofile", isAuthenticated, updateProfile)
router.put("/changepassword", isAuthenticated, changePassword)
router.put("/updatepic", isAuthenticated,singleUpload, updatePic)

//updating user to admin
router
.route("/single/:id")
.get(isAuthenticated,getUserDetails)// this is to get a user detail based on an given ID
.put(isAuthenticated,isAdmin, updateUserToAdmin)

// forget and reset password: for that you have to install a package called nodemailer
router.route("/forgetpassword").post(forgetPassword).put(resetPassword)


export default router;