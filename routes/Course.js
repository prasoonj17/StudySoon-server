const express=require("express")
const router=express.Router()

const{
    createCourse,
    getAllCourses,
    getCourseDetails,
}=require("../controllers/Course")

// category controlle import
const {
    createCategory,
    showAllCategory,
    categoryPageDetails
}=require("../controllers/Category");

// section controller
const{
    createSection,
    updateSection,
    delerteSection
}=require("../controllers/Section")

// subsection
const{
    createSubSection,
    updateSubSection,
    deleteSubSection,
}=require("../controllers/SubSection")

// rating
const{
    createRating,
    getAverageRating,
    getAllRating,
}=require("../controllers/RatingAndReview")

// import middleware
const{auth,isStudent,isInstructor,isAdmin}=require("../middlewares/auth")

// Course route
// course can only be created by instructor
router.post("/createCourse",auth,isInstructor,createCourse)
// add section to the course
router.post("/addSection",auth,isInstructor,createSection);
// update a section
router.post("/updateSection",auth,isInstructor,updateSection)
// deleteSection
router.post("/deleteSection",auth,isInstructor,delerteSection)
// deleteSubSection
router.post("/deleteSubSection",auth,isInstructor,deleteSubSection)
// add subsection to a section
router.post("/addSubSection",auth,isInstructor,createSubSection)
// get all registed course
router.get("/getAllCourse",getAllCourses)
// get details for a specific course
router.post("/getCourseDetails",getCourseDetails);

// ************************************************************************************
// category routers only by admin

router.post("/createCategory",auth,isAdmin,createCategory);
router.get("/showAllCategories",showAllCategory);
router.post("/categoryPageDetails",categoryPageDetails);
// ********************************************888888
// ratind and review

router.post("/createRating",auth,isStudent,createRating);
router.get("/getAverageRating",getAverageRating);
router.get("/getReviews",getAllCourses);

module.exports=router;