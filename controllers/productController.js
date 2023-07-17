const multer = require('multer');
const path = require("path");
const Product = require('../models/productmodel');
const Category = require('../models/categorymodel');

const loadProductList = async (req, res) => {
  try {
    const categories = await Category.find({});
    const product = await Product.find({});
    const categoryMap = new Map();
    categories.forEach((category) => {
      categoryMap.set(category._id.toString(), category.name);
    });

    const getCategoryName = (categoryId) => {
      if (categoryId && categoryId.toString) {
        return categoryMap.get(categoryId.toString());
      } 
    };

    res.render('productList', { product: product, category: categories, getCategoryName });
  } catch (error) {
    console.log(error.message)
  }
}


const createProduct = async (req, res) => {
  const { name, description, category, price } = req.body;
  console.log(req.body);
  let filesArray = []
  console.log(req.files)
  if (req.files && req.files.length > 0) {

    filesArray = Object.values(req.files).flat();
  }
  const images = filesArray.map((file) => file.filename);
  let categories = await Category.find({});


  const newProduct = new Product({
    name,
    description,
    images,
    category,
    price,
  });

  newProduct
    .save()
    .then(() => {
      res.redirect("/productList");

    })
    .catch((err) => {
      console.error("Error adding product:", err);
      res.status(500).send("Error adding product to the database");
    });
};

////editProductList

const editProductList = async (req, res) => {
  try {
    const id = req.query.id;
    const productData = await Product.find({ _id: id });
    const category = productData[0].category;
    const productCategory = await Category.find({ _id: category });
    const allCategory = await Category.find();



    res.render("editProductList", {
      productData,
      productCategory,
      allCategory,
    });
  } catch (error) {
    console.log(error.message);
  }
};

///update product list

const updateProductList = async (req, res) => {
  try {
    const id = req.body.id;
    const name = req.body.name;
    const description = req.body.description;
    const price = req.body.price;
    const category = req.body.category;
    const status = req.body.status === "listed";
    const filesArray = Object.values(req.files).flat();
    const images = filesArray.map((file) => file.filename);

    // Find the existing product data
    const productData = await Product.findById(id);

    // Check if new images are provided
    const updatedImages = images.length > 0 ? images : productData.images;
    console.log(updatedImages);

    const update = await Product.updateOne(
      { _id: id },
      {
        $set: {
          name: name,
          description: description,
          price: price,
          category: category,
          is_listed: status,
          images: updatedImages
        },
      }
    );

    res.redirect('/productList')

  } catch (error) {
    console.log(error.message);
  }
};
module.exports = {
  loadProductList,
  createProduct,
  editProductList,
  updateProductList
}