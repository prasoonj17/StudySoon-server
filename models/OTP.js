const mongoose=require("mongoose");
const mailSender = require("../utility/mailSender");
const {otpTemplate}=require('../mail/templates/emailVerificationTemplate')
const OTPSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
   otp:{
        type:String,
        required:true,
   },
//    ye islea ki otp ka expire banane padega
   createdAt:{
    type:Date, 
    default:Date.now(),
    expires:5*60,
   }
});

// a function->to send emails
async function sendVerificationEmail(email, otp) {
    try {
        const emailBody = otpTemplate(otp); // ✅ use HTML template
        const mailResponse = await mailSender(email, "Verification Email from StudySoon", emailBody);
        console.log("Email sent successfully", mailResponse);
    } catch (error) {
        console.log("Error occurred while sending mails:", error);
        throw error;
    }
}

// pre middleware follow syntax
OTPSchema.pre('save', async function (next) {
    if (this.isNew) {
      await sendVerificationEmail(this.email, this.otp);
    }
    next();
  });

module.exports=mongoose.model("OTP",OTPSchema); 