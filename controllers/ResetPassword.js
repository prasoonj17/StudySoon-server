const User = require("../models/User")
const mailSender = require("../utility/mailSender")
const bcrypt = require("bcrypt")
const crypto=require("crypto");
// resent password token
exports.resetPasswordToken = async (req, res) => {
    try {
        
        // get mail from body
        const email = req.body.email;
        // check user for this email and check validation
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.json({
                success: false,
                message: `Your email is not register with us`,
            })
        }
        // generate token
        const token = crypto.randomBytes(20).toString("hex");
        // update user by adding token and expiration time
        const updateDetails = await User.findOneAndUpdate(
            { email: email },
            {
                token: token,
                resetPasswordExpires: Date.now() + 3600000,
            },
            { new: true }
        );
        // create url
        const url = `http://localhost:/update-password/${token}`
        // send mail containig url
        await mailSender(email,
            "Password Reset Link",
            `Password reset Link ${url}`

        );
        return res.json({
            success: true,
            message: 'Email sent successfully, please check email and change password',
            token
        });
    }
    catch (error) {
        console.log(error)
        return res.json({
            success: false,
            message: `something went wrond try later ${error.message}`,
        });
    }
}

exports.resetPassword = async (req, res) => {
    try {
        // data fetch
        const { password, confirmPassword, token } = req.body;
        //  validation chekc
        if (password !== confirmPassword) {
            return res.password({
                success: false,
                message: "Password not matching"
            })
        }
        // get userdetails from db using token
        const userDetals = await User.findOne({ token: token });
        // if no entry'
        if (!userDetals) {
            return res.json({
                success: false,
                message: "token is invalid"
            });
        }
        // token time check 
        if (userDetals.resetPasswordExpires < Date.now()) {
            return res.json({
                success: false,
                message: "time exceed"
            })
        }
        // hash pass
        const hashedPassword = await bcrypt.hash(password, 10);

        // pass update
        await User.findOneAndUpdate(
            { token: token },
            { password: hashedPassword },
            { new: true },
        );
        return res.status(200).json({
            success: true,
            message: "Password resent successfully"
        });
    } catch (error) {
        console.log(error)
        return res.status(401).json({
            success: false,
            message: "something wrong"
        });
    }
}