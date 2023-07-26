const Quantity = require("../models/quantitymodel");
const Category = require("../models/categorymodel");
const Product = require("../models/productmodel");

//Display Add quantity page

const displayAddQuantity = async (req, res) => {
  try {
    const products = await Product.find();
    const activeMenuItem = "admin/addquantity";
    res.render("addquantity", {
      title: "Add quantity",
      products: products,
      layout: "layouts/adminHome",
      activeMenuItem,
    });
  } catch (error) {
    console.log(error.message);
  }
};

//add quantity
const addQuantity = async (req, res) => {
  try {
    const { product, size, productPrice, stock } = req.body;
  
    const quantityObj = {
      product,
      size,
      productPrice,
      stock,
    };
    const isProduct = await Quantity.findOne({ product });

    if (isProduct) {
      const quantityExist = isProduct.quantities.findIndex(
        (q) => q.size === Quantity
      );
      if (quantityExist !== -1) {
        res.render("addquantity", {
          message: "This combination already exists",
        });
      } else {
        await Quantity.updateOne(
          { product },
          { $push: { quantities: quantityObj } }
        );
        res.redirect("/showquantity");
      }
    } else {
      const newQuantity = new Quantity({
        product,
        quantities: quantityObj,
      });

      await newQuantity.save();
      await Product.updateOne({ _id: product }, { $inc: { stock: stock } });

      res.redirect("/showquantity");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error"); // Sending an error response in case of an error
  }
};

//display quantity page
const showQuantity = async (req, res) => {
  try {
    const products = await Quantity.find({}).populate("product").exec();
    const categories = await Category.find();
    const categoryMap = new Map();
    categories.forEach((category) => {
      categoryMap.set(category._id.toString(), category.name);
    });

    //  function getCategoryName (category)  {
    //     return category.toString()
    //   }
    function getCategoryName(category) {
      return category
        ? categoryMap.get(category.toString())
        : "Unknown Category";
    }

    const activeMenuItem = "/showquantity";
    res.render("showquantity", {
      title: "product with quantity",
      products,
      getCategoryName,
      layout: "layouts/adminHome",
      activeMenuItem,
    });
  } catch (error) {
    console.log(error.message);
  }
};


//display size to the frontend
const getsize = async (req, res) => {
  try {
    //Get the product id and the selected size from the query parameters
    const { productId, Size } = req.query;
    //Find the quantity document by the product id and select only the quantities field
    const variant = await Quantity.findOne(
      { product: productId },
      { quantitiies: 1 }
    );

    //Filter the variants array and get only the ones that have the selected size
    let quant = variant.quantities.filter(
      (variantElement) => variantElement.size === Size
    );
    console.log(quant);
    //Send back the colors array as a JSON response
    res.json(colors);
  } catch (error) {
    console.log(error.message);
  }
}







module.exports = {
  displayAddQuantity,
  addQuantity,
  showQuantity,
  getsize
};
