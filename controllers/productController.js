const multer = require("multer");
const path = require("path");
const Product = require("../models/productmodel");
const Category = require("../models/categorymodel");
const { findById } = require("../models/adminmodel");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

const upload = multer({ storage: storage }).array("images", 5); // Set the field name used in the form

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

    res.render("productList", {
      product: product,
      category: categories,
      getCategoryName,
    });
  } catch (error) {
    console.log(error.message);
  }
};

//to render add product page
const showAddProduct = async (req, res) => {
  try {
    const categories = await Category.find({ isListed: true })
    
    res.render('addProduct', { category: categories })
  } catch (error) {
    console.log(error.message);
  }
}
const createProduct = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        console.error("Error uploading files:", err);
        return res.status(500).send("Error uploading files");
      }
      const { name, description, category, price, stock } = req.body;
      let images = [];

      if (req.files && req.files.length > 0) {
        images = req.files.map((file) => file.filename);
      }

      const newProduct = new Product({
        name,
        description,
        images,
        category,
        price,
        stock,
      });

      await newProduct.save();

      res.redirect("/productList");
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).send("Error adding product to the database");
  }
};

;

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

//edit product list

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
    

    const update = await Product.updateOne(
      { _id: id },
      {
        $set: {
          name: name,
          description: description,
          price: price,
          category: category,
          is_listed: status,
          images: updatedImages,
        },
      }
    );
    res.redirect("/productList");
  } catch (error) {
    console.log(error.message);
  }
};
//list nd unlist
const changeStatus = async (req, res) => {
  try {
    const product_id = req.query.id;
    const product = await Product.findById(product_id);

    if (product) {
      const updatedStatus = !product.is_listed;
      product.is_listed = updatedStatus;
      await product.save();
    }

    res.redirect("/productList");
  } catch (error) {
    console.log(error.message);
  }
};

//delete product

const deleteProduct = async (req, res) => {
  try {
    const id = req.query.id;

    const product = await Product.findByIdAndDelete(id);

    res.redirect("/productList");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadProductList,
  createProduct,
  editProductList,
  updateProductList,
  deleteProduct,
  changeStatus,
  showAddProduct,
};
