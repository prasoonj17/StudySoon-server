const mongoose=require("mongoose")

const courseProgress=new mongoose.Schema({
    courseID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course"//Course model
    },
    completedVideos:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"SubSection"//Course model
    }]
}); 

module.exports=mongoose.model("CourseProgress",courseProgress);