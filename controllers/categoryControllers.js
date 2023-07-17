const Category = require("../models/categorymodel")


// Now you can use the Category model to interact with the database

const loadCategory = async (req, res) => {
    try {
        const categories = await Category.find()
        res.render('categories', { categories })
    } catch (error) {
        console.log(error)
    }
}

const addCategory = async (req, res) => {
    try {
        const name = req.body.name;
        const existingCategory = await Category.findOne({ name: name })
        if (existingCategory) {
            const categories = await Category.find()
            res.render('categories', { message: 'name already exists' })

        }
        else {
            const category = new Category({
                name: req.body.name,
                description: req.body.description,
            })
            const savedCategory = await category.save();
            res.redirect("/loadCategory")
        }
    } catch (error) {
        console.log(error.message)
    }
}


const showCategory = async (req, res) => {
    try {
        res.redirect('/loadCategory')
    } catch (error) {
        console.log(error.message)
    }

}

const updateCategory = async (req, res) => {
    try {
        const categoryId = req.body.id;
        const updatedCategory = await Category.findByIdAndUpdate({ _id: categoryId }, { $set: { name: req.body.category, description: req.body.description } })
        res.redirect('/loadCategory')
    } catch (error) {
        console.log(error.message)
    }
}

const loadUpdateCategory = async (req, res) => {
    try {
        const id = req.query.id
        const Categorydata = await Category.findById({ _id: id })
        res.render('editcategories', { category: Categorydata })
    } catch (error) {
        console.log(error.message)
    }
}


module.exports = {
    loadCategory,
    addCategory,
    showCategory,
    updateCategory,
    loadUpdateCategory,
    
}