const SubSection = require("../models/SubSection");
const section = require("../models/Section")
const { uploadImageToCloudinary } = require("../utility/imageUpload");
const Section = require("../models/Section");


// create SubSection

exports.createSubSection = async (req, res) => {
    try {
        // fetch data from req body
        const { sectionId, title, timeDuration, description } = req.body;
        // extract file/video
        const video = req.files.videoFile;
        // validation
        if (!sectionId || !title || !timeDuration || !description || !video) {
            return res.status(400).json({
                success: false,
                message: "all fields are required",
            });
        }
        // upload videps to cloudnary(that return secure__url)
        const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);

        // create a sub_section
        const SubSectionDetails = await SubSection.create({
            title: title,
            timeDuration: timeDuration,
            description: description,
            videoUrl: uploadDetails.secure_url,
        })
        // update section with this sub section ObjectId
        const updatedSection = await Section.findByIdAndUpdate({ _id: sectionId },
            {
                $push: {
                    subSection: SubSectionDetails._id,
                }
            }, { new: true }).populate("subSection");
        console.log(updatedSection);
        // hw:Log updated section here,after adding populate query
        return res.status(200).json({
            success: true,
            message: "SubSEction created successfully",
            updatedSection,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
}
// hw:updated subsection

exports.updateSubSection = async (req, res) => {
    try {
        const { subSectionId, title, timeDuration, description } = req.body;

        if (!subSectionId) {
            return res.status(400).json({
                success: false,
                message: "SubSection ID is required",
            });
        }
        // find and update subSection
        const updatedSubSection = await SubSection.findByIdAndUpdate(
            subSectionId,
            { title, timeDuration, description },
            { new: true }
        )
        if (!updatedSubSection) {
            return res.status(404).json({
                success: false,
                message: "SubSection not found",
            });
        }

        // send res
        return res.status(200).json({
            success: true,
            message: "SubSection updated successfully",
            updatedSubSection,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
}

// hw:delete subseciton
exports.deleteSubSection=async(req,res)=>{
    try {
        // fetch
        const {subSectionId,sectionId}=req.params;
        if (!subSectionId || !sectionId) {
            return res.status(400).json({
                success: false,
                message: "SubSection ID and Section ID are required",
            });
        }
        const deletedSubSection=await SubSection.findByIdAndDelete(subSectionId);
        if(!deletedSubSection){
            return res.status(404).json({
                success: false,
                message: "SubSection not found",
            });
        }
        // remove subsection reference from section
        await Section.findByIdAndUpdate(
            sectionId,
            {$pull:{subSection:subSectionId}},
            {new:true}
        );
        return res.status(200).json({
            success: true,
            message: "SubSection deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
}