const RatingAndReview = require("../models/RatingAndReview")
const Course = require("../models/Course");
const { default: mongoose } = require("mongoose");

// create Rating
exports.createRating = async (req, res) => {
    try {
        // get user id
        const userId = req.user.id;
        // fetched from req body
        const { rating, review, courseId } = req.body;

        // check if user is enrolled(for course) or not
        const courseDetails = await Course.findOne(
            {
                _id: courseId,
                studentsEnrolled: { $elemMatch: { $eq: userId } },
            });

        if (!courseDetails) {
            return res.status(400).json({
                success: false,
                message: "Student is not enrolled in the course",
            });
        }
        // check if user alread reviewd the course
        const alreayReviewed = await RatingAndReview.findOne({
            user: userId,
            course: courseId,
        })
        if (alreayReviewed) {
            return res.status(403).json({
                success: false,
                message: "course is already reviewed by the user",
            });
        }
        // create rating and review
        const ratingReview = await RatingAndReview.create({
            rating, review,
            course: courseId,
            user: userId,
        });
        // update course with the rating/review
        const updatedCourseDetails = await Course.findByIdAndUpdate({ _id: courseId },
            {
                $push: {
                    ratingAndReviews: ratingReview._id,
                }
            },
            { new: true }
        );
        console.log(updatedCourseDetails);
        return res.status(403).json({
            success: true,
            message: "review done",
            ratingReview,
        });


    } catch (error) {
        return res.status(403).json({
            success: false,
            message: message.error,
        });
    }
}

// get average rating
exports.getAverageRating = async (req, res) => {
    try {
        // get course id
        const courseId = req.body.courseId;
        // calculate avg rating
        const result = await RatingAndReview.aggregate([
            {
                $match: {
                    course: new mongoose.Types.ObjectId(courseId),
                },
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" },
                }
            }
        ])
        // return rating
        if (result.length > 0) {
            return res.status(200).json({
                success: true,
                averageRating: result[0].averageRating,
            });
        }
        // if no rating exist
        return res.status(200).json({
            success: true,
            message: "average rating is 0, no rating till now",
            averageRating: 0,
        });
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: message.error,
        });
    }
}

// get all rating
exports.getAllRating = async (req, res) => {
    try {
        const allReviews = await RatingAndReview.find({})
            .sort({ rating: "desc" })
            .populate({
                path: "User",
                select: "firstName lastName email image",//qki user id m he to use populatr krege and sirf ye "firstName lastName email image" data populate krege
            })
            .populate({
                path: "course",
                select: "courseName",
            })
            .exec();

        return res.status(200).json({
            success: true,
            message: "All reviews fetched successfully",
            data: allReviews,
        });
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: message.error,
        });
    }
}