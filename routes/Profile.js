const express=require("express")
const router=express.Router()
const {auth,isInstructor,isStudent}=require("../middlewares/auth")

const{updateProfile,deleteAccount,getAllUserDetails,
    updateDisplayPicture,getEnrolledCourses,instructorDashboard}=require("../controllers/Profile")

// profile routers
router.delete("/deleteProfile",auth,deleteAccount);
router.put("/updateProfile",auth,updateProfile);
router.get("/getUserDetails",auth,getAllUserDetails);
// get enrolled course
router.get("/getEnrolledCourses",auth,isStudent,getEnrolledCourses);
router.put("/updateDisplayPicture",auth,updateDisplayPicture);
router.get("/instructorDashboard", auth, isInstructor, instructorDashboard)

module.exports=router