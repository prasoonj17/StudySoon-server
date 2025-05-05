const mongoose=require("mongoose")

const courseSchema=new mongoose.Schema({
    courseName:{
        type:String,
        require:true,
        trim:true,
    },
    courseDescription:{
        type:String,
    },
    instructor:{
        type:mongoose.Schema.Types.ObjectId,
        require:true,
        ref:"User"
    },
    instructors:{
        type:[String],
    },
    whatWillYouLearn:{
        type:String,
    },
    courseContent:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Section",
    }],
    ratingAndReviews:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"RatingAndReview",
    }],
    price:{
        type:Number,
    },
    thumbnail:{
        type:String,
    },
    tag:{
        type:[String],
        required:true,
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category",
    },
    studentsEnrolled:[{
        type:mongoose.Schema.Types.ObjectId,
        require:true,
        ref:"User",
    }],
    status:{
        type:String,
        enum:["Draft","Published"],
    }
    
}); 

module.exports=mongoose.model("Course",courseSchema)