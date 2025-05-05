const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User")
const mailSender = require('../utility/mailSender');
const { courseEnrollmnetEmail } = require("../mail/templates/courseEnrollmnetEmail")
const { default: mongoose } = require("mongoose");

// capture the payment and initiate the Razorpay order
exports.capturePayment = async (req, res) => {
    // get courseId and Userid
    const { course_id } = req.body
    const userId = req.user.id;
    // validation
    // validate courseId
    if (!course_id) {
        return res.json({
            success: false,
            message: "Please provide valid course ID",
        })
    }
    // vlaid coursedetail
    let course;
    try {
        course = await Course.findById(course_id);
        if (!course) {
            return res.json({
                success: false,
                message: "Please provide valid course",
            })
        }
        // user alredy pay or not
        // Qki studentEnrolled Course schema me  id k roop m he islea compaire krne ko userID ko id k room m banana hoga jo abhi  stirng m h
        const uid=new mongoose.Types.ObjectId(userId);
        if(course.studentsEnrolled.includes(uid)){
            return res.json({
                success: false,
                message: "Student alredy enrolled",
            })
        }
    } catch (error) {
        console.log(error)
        return res.json({
            success: false,
            message: error.message,
        })
    }

    // order create
    // all syntax
    const amount=course.price;
    const currency="INR";
    const options={
        amount:amount*100,
        currency,
        receipt:Math.random(Date.now()).toString(),
        notes:{
            courseId:course_id,
            userId,
        }
    };
    try {
        // initiate the payment using razorpay
        const paymentResponse=await instance.orders.create(options)
        console.log(paymentResponse);
        // return res
        return res.status(200).json({
            success:true,
            courseName:course.courseName,
            courseDescription:course.courseDescription,
            thumbnail:course.thumbnail,
            orderId:paymentResponse.id,
            currency:paymentResponse.currency,
            amount:paymentResponse.amount,
        })
    } catch (error) {
        console.error(error)
        return res.json({
            success: false,
            message: error.message,
        })
    }
};

// verify signature of razorpay and server
// syntax
exports.verifySignature=async (req,res)=>{
    const webhookSecret="12345678";

    const signature=req.headers("x-razorpay-signature");

    const shasum=crypto.createHmac("sha256",webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest=shasum.digest("hex");
    if(signature===digest){
        console.log("Payment is Authorised");

        const {courseId,userId}=req.body.payload.payment.entity.notes;

        try {
            // fulfil the actin
            // find the cours3e and enroll the student in it
            const enrolledCourse=await Course.findByIdAndUpdate(
                {_id:courseId},
                {$push:{studentsEnrolled:userId}},
                {new:true},
            )
            if(!enrolledCourse){
                return res.status(500).json({
                    success: false,
                    message: "course not found",
                }) 
            }
            console.log(enrolledCourse);

            // find the student and add the course to their list enrolled course me
            const enrolledStudent=await User.findByIdAndUpdate(
                {_id:userId},
                {$push:{courses:courseId}},
                {new:true},
            )
            console.log(enrolledStudent);

            // mail send kro conformation vala
            const emailResponse=await mailSender(
                enrolledStudent.email,
                "contrats from StudySoon",
                "congrats ,you are onboarded into new StudySoon course",
            )
            return res.status(200).json({
                success: true,
                message: "Signature verify and course addend",
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
            }) 
        }
    }
    else{
        return res.status(500).json({
            success: false,
            message: "Invalid request",
        });
    }
    
}
