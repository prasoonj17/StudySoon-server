const express = require("express");
const app = express();

const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");  // spelling corrected
const paymentRoutes = require("./routes/Payment");
const courseRoutes = require("./routes/Course");

const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");

dotenv.config();
const PORT = process.env.PORT || 4000;

database.connectDB();

// middlewares
app.use(express.json());
app.use(cookieParser());

// CORS configuration to allow both local and production domains
app.use(cors({
  origin: ["http://localhost:5173", "https://studysoonbyprasoon.vercel.app"],  // Allow both local and production domains
  credentials: true,  // Allow credentials like cookies
}));

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/temp",
  })
);

// cloudinary connection
cloudinaryConnect();

// routes
app.use("/auth",userRoutes)
app.use("/profile",profileRoutes)
app.use("/course",courseRoutes)
app.use("/payment",paymentRoutes)

// default route
app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Your server is up and running...",
  });
});

app.listen(PORT, () => {
  console.log(`App is running at ${PORT}`);
});
