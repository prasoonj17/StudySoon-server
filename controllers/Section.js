const Section=require("../models/Section");
const Course=require("../models/Course")
const SubSection=require("../models/SubSection")

exports.createSection=async(req,res)=>{
    try {
        // data fetch
        const {sectionName,courseId}=req.body;
        // data validation
        if(!sectionName||!courseId){
            return res.status(400).json({
                success:false,
                message:"Missing Properties",
            });
        }
        // create section
        const newSection=await Section.create({sectionName});
        // update course with section objectID
        const updatedCourseDetails=await Course.findByIdAndUpdate(
            courseId,{
                $push:{
                    courseContent:newSection._id,
                }
            },
            {new:true},
        )
        // HW:ue populate to replace sections/sub-sections both in the updatedCourseDetails
        // .populate({
        //     path:'courseContent',
        //     populate:{
        //         path:"subSection",// Assuming 'subSections' is a field in Section schema
        //     }
        // })

        // return res
        return res.status(200).json({
            success:true,
            message:"Section created",
            updatedCourseDetails,
        });

    } catch (error) {
        console.log(error)
        return res.status(400).json({
            success:false,
            message:"unable to create Section,Please try again",
            error:error.message,
        });
    }
}

exports.updateSection=async(req,res)=>{
    try {
        // daya input
        const{sectionName,sectionId}=req.body
        // data validation
        if(!sectionName||!sectionId){
            return res.status(400).json({
                success:false,
                message:"Missing Properties",
            });
        }

        // update data
        const section=await Section.findByIdAndUpdate(sectionId,{sectionName},{new:true});

        // return res
        return res.status(200).json({
            success:true,
            message:"Section updated",
        });

    } catch (error) {
        console.log(error)
        return res.status(400).json({
            success:false,
            message:"unable to update Section,Please try again",
            error:error.message,
        });
    }
}

// delete section
exports.delerteSection=async (req,res)=> {
    try {
        const { sectionId, courseId } = req.body;

        // Check if sectionId is provided
        if (!sectionId) {
            return res.status(400).json({
                success: false,
                message: 'Section ID is required',
            });
        }

        // Find the section
        const sectionDetails = await Section.findById(sectionId);
        if (!sectionDetails) {
            return res.status(404).json({
                success: false,
                message: 'Section not found',
            });
        }

        // Delete all related SubSections using Promise.all
        await Promise.all(
            sectionDetails.subSection.map(async (ssid) => {
                await SubSection.findByIdAndDelete(ssid);
            })
        );

        console.log('Subsections within the section deleted');

        // Delete the section
        await Section.findByIdAndDelete(sectionId);
        console.log('Section deleted');

        // Update course content
        const updatedCourse = await Course.findById(courseId)
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            });

        return res.status(200).json({
            success: true,
            message: 'Section deleted successfully',
            updatedCourse,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete Section',
            error: error.message,
        });
    }
};
