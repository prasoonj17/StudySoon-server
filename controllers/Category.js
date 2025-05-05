const Category = require("../models/Category")

// create category handler

exports.createCategory = async (req, res) => {
    try {
        // fetch data
        const { name, description } = req.body;
        // validation
        if (!name || !description) {
            return res.status(500).json({
                success: false,
                message: 'All fields are require',
            })
        }
        // create entry
        const categoryDetails = await Category.create({
            name: name,
            description: description,
        });
        return res.status(500).json({
            success: true,
            message: "Category Created successfully",
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

// get all categorys
exports.showAllCategory = async (req, res) => {
    try {
        // isme koi critariya nai h bus ek chez yaad rakhna ki jo bhi data lao usme name and description hona chahea
        const allCategorys = await Category.find({}, { name: true, description: true });
        return res.status(200).json({
            success: true,
            message: "all categorys return successfully",
            allCategorys,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

// category pages detail
exports.categoryPageDetails = async (req, res) => {
    try {
        // get categoryId
        const { categoryId } = req.body;
        // get courses for specified categoryId
        const selectedCategory = await Category.findById(categoryId)
            .populate("courses")
            .exec();

        // validation
        if (!selectedCategory) {
            return res.status(404).json({
                success: false,
                message: "Data not found",
            });
        }
        // get coursefor different category
        const differentCategory = await Category.find({
            _id: { $ne: categoryId },
        })//ne: not equla
            .populate("courses")
            .exec()

        // get top 10 selling courses
        // HW-write it on your own
        // const topSellingCourses=await Course.find({})
        // .sort({salesCount:-1})
        // .limit(10)
        // .exec();
        return res.status(200).json({
            success: true,
            data: {
                selectedCategory,
                differentCategory,
                topSellingCourses,
            }
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}