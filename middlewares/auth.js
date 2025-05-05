const jwt = require("jsonwebtoken")
require("dotenv").config();
const User = require("../models/User");

// auth
exports.auth = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");
        const token =
            req.body?.token ||
            (authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token is missing",
            });
        }

        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decode;
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "Token is invalid",
            });
        }

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Something went wrong while validating token",
        });
    }
};


// is student
exports.isStudent = async (req, res, next) => {
    try {
      console.log("👉 Inside isStudent middleware");
      console.log("👤 User from token:", req.user);
  
      const type = req.user?.accountType;
      console.log(req.user.accountType)
      console.log("🔍 Account Type:", type);
  
      if (!type || type.toLowerCase() !== "student") {
        console.log("❌ Access Denied");
        return res.status(401).json({
          success: false,
          message: "Only students are allowed to access this route.",
        });
      }
  
      console.log("✅ Student verified");
      next();
    } catch (err) {
      console.error("🚨 Error in isStudent middleware:", err.message);
      res.status(500).json({
        success: false,
        message: "Something went wrong while verifying user role",
      });
    }
  };
  
// is Instructor
exports.isInstructor = async (req, res, next) => {
    try {
        console.log(req.user.accountType)
        if (req.user.accountType !== "Instructor") {
            return res.status(401).json({
                success: false,
                message: "this is a protected route for Instructor only",

            })
        } next();

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "User role cnanot be verify",
        })
    }
}

// is admin 
exports.isAdmin = async (req, res, next) => {
    try {
        if (req.user.accountType !== "Admin") {
            return res.status(401).json({
                success: false,
                message: "this is a protected route for Admin only",

            })
        } next();

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "User role cnanot be verify",
        })
    }
}