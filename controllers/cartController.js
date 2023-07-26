const cart = require("../models/cartmodel");

const addtocart = async (req, res) => {
  try {
    res.render("cart");
  } catch (error) {
    console.log(error.message);
  }
};


module.exports = {
    addtocart
}