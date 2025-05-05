const User = require("../models/User")
const OTP = require("../models/OTP")
const otpGenerator = require('otp-generator');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// const mailSender = require("../utility/mailSender");
const mailSender=require('../utility/mailSender')
require("dotenv").config()
const Profile=require("../models/Profile")

// sendOTP
exports.sendOTP = async (req, res) => {
    try {
        // fetch email from request ki body
        const { email } = req.body;

        // check if already exist
        const checkUserPresent = await User.findOne({ email });

        // if already present
        if (checkUserPresent) {
            return res.status(401).json({
                success: false,
                message: "user already register",
            })
        }
        // generate otp(jo hme install kea tha otp-generate uska syntax)
        let otp = otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });
        

        console.log("OTP generated", otp);
        // check unique otp or not
        let result = await OTP.findOne({ otp: otp });
        while (result) {
            otp = otpGenerator(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            })
            result = await OTP.findOne({ otp: otp });
        }
        //  otp entry in database
        // in otp schema {email,otp,date} are attribute but date is default so we only two
        const otpPayload = { email, otp }
        const otpBody = await OTP.create(otpPayload);
        // return response successful
        res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
            otp,
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

// signup
exports.signUp = async (req, res) => {
    try {
        // data fetch from request ki body
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = req.body;
        // validare krlo
        if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
            return res.status(403).json({
                success: false,
                message: "All field are required",
            })
        }
        // 2 password match krna
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and Confirm Password does not mathch,please try again"
            });
        }
        // chek user already exist or not
        const exestingUser = await User.findOne({ email });
        if (exestingUser) {
            return res.status(400).json({
                success: false,
                message: 'User is already registered',
            })
        }
        
        // find most recent otp stored for the user
        const recentOTP = await OTP.findOne({ email }).sort({ createdAt: -1 });
        console.log(recentOTP);
        if (!recentOTP) {
            return res.status(400).json({
                success: false,
                message: "OTP not found",
            });
        }
        // validate OTP
        // if (recentOTP.length == 0) {
        //     // otp not found
        //     return res.status(400).json({
        //         success: false,
        //         message: "OTP Founded"
        //     })
        // }
        // find hua otp aagar jo bhja otp uske equal nai he to
        else if (otp !== recentOTP.otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }
        // hash pass
        const hashedPassword = await bcrypt.hash(password, 10);

        //  entry create in db

        // create additional detail
        const profileDetail = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null,
        })
        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            accountType,
            contactNumber,
            additionalDetails: profileDetail._id,//isse har id ka profile detail aaiga
            // to add all user image we use third part liberary
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        })
        return res.status(200).json({
            success: true,
            message: `User is registed successfully`,
            user,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: `User cannot be registed successfully  :${error.message}`,
        })
    }
}

// log up
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email or Password is missing',
            });
        }

        const existingUser = await User.findOne({ email })
            .populate("additionalDetails")
            .exec();

        if (!existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email not registered',
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect password',
            });
        }

        const payload = {
            id: existingUser._id,
            email: existingUser.email,
            accountType: existingUser.accountType,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });
        existingUser.password = undefined;

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            existingUser,
        });

    } catch (error) {
        console.error("LOGIN ERROR:", error);
        return res.status(500).json({
            success: false,
            message: 'Login failed, please try again',
        });
    }
};

// changePassword
exports.changePassword = async (req, res) => {
    try {
        // get data from req body
        // get oldPassword,newPassword,confirmNewPassword
        const { oldPassword, newPassword } = req.body;
        // validation
        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "ALL field are required",
            });
        }
        // check if new pass and confirm pass match
        // if (newPassword !== confirmNewPassword) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "New Password and Confirm New Password do not match",
        //     });
        // }
        // get user details
        const user = await User.findById(req.user.id);
        // check if old pass is correct or not
        const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Old password is incorrect",
            });
        }

        // hash pass
        const hashedPass = await bcrypt.hash(newPassword, 10);
        // update pwd in db
        user.password = hashedPass;
        await user.save();
        // send mail-Password updated
        await mailSender(user.email, "Password updated", "Your password has been successfuly updated.");
        // return response
        return res.status(200).json({
            success: true,
            message: "Password updated successfully",
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while updating the password",
        });
    }

}