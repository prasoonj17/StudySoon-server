const Course = require("../models/Course")
const Category = require("../models/Category")
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utility/imageUpload")

// Create Course handler function
// Create Course handler function
exports.createCourse = async (req, res) => {
    try {
        // Extract data from request body
        const { courseName, courseDescription, whatWillYouLearn, price, category } = req.body;

        // Check for thumbnail file
        if (!req.files || !req.files.thumbnailImage) {
            return res.status(400).json({
                success: false,
                message: "Thumbnail image is required",
            });
        }

        const thumbnail = req.files.thumbnailImage;

        // Validation
        if (!courseName || !courseDescription || !whatWillYouLearn || !price || !category) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // Check instructor details
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);
        if (!instructorDetails) {
            return res.status(400).json({
                success: false,
                message: "Instructor details not found",
            });
        }

        // Check if category is valid
        const categoryDetails = await Category.findById(category);
        if (!categoryDetails) {
            return res.status(400).json({
                success: false,
                message: "Category not found",
            });
        }

        // Upload image to Cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        // Create new course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatWillYouLearn,
            price,
            category: categoryDetails._id,
            thumbnail: thumbnailImage.secure_url,
        });

        // Add course to instructor's profile
        await User.findByIdAndUpdate(
            instructorDetails._id,
            { $push: { courses: newCourse._id } },
            { new: true }
        );

        // Add course to category schema
        await Category.findByIdAndUpdate(
            categoryDetails._id,
            { $push: { courses: newCourse._id } },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Course created successfully",
            data: newCourse,
        });

    } catch (error) {
        console.error("Error creating course:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
};

// get ALL Course handler function
exports.getAllCourses = async (req, res) => {
    try {
        // TODO: change the below statement   
        const allCourses = await Course.find({});
        return res.status(200).json({
            success: true,
            message: "data for all courses fetched successfully",
            data: allCourses,
        });
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            success: false,
            message: "Something wrong",
        });
    }
}

// getCourseDetails
exports.getCourseDetails = async (req, res) => {
    try {
        // get id
        const {courseId}=req.body;
        // find course details
        const CourseDetails=await Course.find(
                                {_id:courseId})
                                .populate(
                                    {
                                        path:"instructor",
                                        populate:{
                                            path:"additionalDetails",
                                        },
                                    }
                                )
                                .populate("category")
                                .populate("ratingAndReviews")
                                .populate({
                                    path:"courseContent",
                                    populate:{
                                        path:"subSection",
                                    },
                                })
                                .exec();//ye sb id(ref) k form m the islea in epopulate kea, or nested islea qki jinse ye ref the vobhi id k form m the

        // validation
        if(!CourseDetails){
            return res.status(400).json({
                success:false,
                message:`could not find the course with ${courseId}`
            })
        }
        // return res
        return res.status(200).json({
            success:true,
            message:"course detail fetched successfully",
            data:CourseDetails,
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}