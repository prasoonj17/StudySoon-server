const express=require("express")
const app=express();

const userRoutes=require("./routes/User")
const profileRoutes = require("./routes/Profile")  // spelling!
const paymentRoutes=require("./routes/Payment")
const courseRoutes=require("./routes/Course")

const database=require("./config/database")
const cookieParser=require("cookie-parser")
const cors=require("cors")
const {cloudinaryConnect}=require("./config/cloudinary")
const fileUpload=require("express-fileupload")
const dotenv=require("dotenv");

dotenv.config()
const PORT=process.env.PORT||4000
database.connectDB()

// middlewares
app.use(express.json());
app.use(cookieParser());
// for frontend  frontend run 3000 and backend run 4000
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use(
    fileUpload({
        useTempFiles:true,
        tempFileDir:"/temp"
    })
)

// cloudinary connection
cloudinaryConnect();

// routes
app.use("/api/v1/auth",userRoutes)
app.use("/api/v1/profile",profileRoutes)
app.use("/api/v1/course",courseRoutes)
app.use("/api/v1/payment",paymentRoutes)

// def route
app.get("/",(req,res)=>{
    return res.json({
        success:true,
        message:"ypur server is up and running..."
    })
})

app.listen(PORT,()=>{
    console.log(`app is runningat ${PORT}`)
})