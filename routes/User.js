const express=require("express");
const router=express.Router();

const {login,signUp,changePassword, sendOTP}=require("../controllers/Auth")
const{resetPasswordToken,resetPassword}=require("../controllers/ResetPassword")

const{auth}=require("../middlewares/auth");

// routers for login,signup,and authentication

// route for login
router.post("/login",login);

// router for user signup
router.post("/signup",signUp);

// router for send otp
router.post("/sendotp",sendOTP);



// router for changind pass
router.post("/changepassword",auth,changePassword)

// ******************************************************************************
// reset password

// for generate a reset password token
router.post("/reset-password-token",resetPasswordToken);

// cor reset user's pss after verification
router.post("/reset-password",resetPassword);

module.exports=router