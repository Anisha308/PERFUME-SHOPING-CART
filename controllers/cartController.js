const Cart = require("../models/cartmodel");
const Product = require("../models/productmodel");
const User = require("../models/usermodel");
const Address = require("../models/addressmodell");



const userCart = async (req, res) => {
  const user = req.session.user;

  if (user) {
    try {
      const userId = req.session.user.id;;
      const cart = await Cart.findOne({ userId: userId }).populate(
        "products.productId"
      );

      let products = [];
      let productCount;
      if (cart) {
        productCount = cart.products.length;

        if (productCount > 0) {
          products = cart.products;

          res.render("cart", {
            user,
            products,
            productCount,
            cartId: cart._id,
          }); // Pass productCount as a local variable
        } else {
          res.render("cart", { user, productCount, cartId: cart._id }); // Pass productCount as a local variable
        }
      } else {
        productCount = 0;
        res.render("cart", { user, productCount, cartId: cart._id }); // Pass user as a local variable
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Some Error occurred");
    }
  } else {
    res.render("home", { msg: "You need to Login first" });
  }
};


// Function to add an item to the cart
const addToCart = async (req, res) => {
  try {
    const userId = req.session.user?.id;
    if (!userId) {
      res.json({
        status: "error",
        message: "Please Login to add items in cart",
      });
    }
    const productId = req.params.id;
    const product_data = await Product.findById(productId);
    if (!product_data) {
      console.log("Product not found in the database.");

      return res.json({
        status: "error",
        message: "Product not found",
      });
    }

    let userCart = await Cart.findOne({ userId: userId });           
    if (!userCart) {
      // If the user's cart doesn't exist, create a new cart
      userCart = new Cart({ userId: userId, products: [] });
    }

    const productIndex = userCart.products.findIndex(
      (product) => product.productId.toString() === productId
    );

    if (productIndex === -1) {
      //if the product is not in the cart, add it
      userCart.products.push({ productId, quantity: 1 });
    } else {
      // If the product is already in the cart, increase its quantity by 1
      userCart.products[productIndex].quantity += 1;
    }
console.log(userCart,"kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk");
    await userCart.save();
    res.json({
      status: "success",                 
      message: "Added to cart",
    });
  } catch (error) {
    console.error(error);
    res.json({
      status: "error",
      message: "An error occurred",
    });
  }
};


const incrementQuantity = async (req, res) => {
  const { productId, cartId } = req.body;
  try {
    // Find the cart using the provided cartId and populate the product details
    let cart = await Cart.findOne({ _id: cartId }).populate(
      "products.productId"
    );
    if (!cart) {
      return res.json({ success: false, message: "Cart not found" });
    }

    // Find the index of the product in the cart based on the productId
    const cartIndex = cart.products.findIndex((item) =>
      item.productId._id.equals(productId)
    );

    // Check if the product is present in the cart
    if (cartIndex === -1) {
      return res.json({
        success: false,
        message: "Product not found in the cart",
      });
    }

    // Increment the product quantity and save the cart
    cart.products[cartIndex].quantity += 1;
    await cart.save();

    // Calculate the total price for the product and get the remaining quantity
    const product = cart.products[cartIndex].productId;
    const total = cart.products[cartIndex].quantity * product.price;
    const remain = product.quantity - cart.products[cartIndex].quantity;

    res.json({
      success: true,
      total,
      quantity: cart.products[cartIndex].quantity,
      mess: remain > 0 ? remain : "out of stock",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Failed to update quantity" });
  }
};


const  decrementQuantity = async (req, res) => {
  const { productId, cartId } = req.body;
  try {
    const stock = req.body.quantity
    // Find the cart using the provided cartId and populate the product details
    let cart = await Cart.findOne({ _id: cartId }).populate(
      "products.productId"
    );
    console.log(cart)
    if (!cart) {
      return res.json({ success: false, message: "Cart not found" });
    }

    // Find the index of the product in the cart based on the productId
    const cartIndex = cart.products.findIndex((item) =>
      item.productId._id.equals(productId)
    );
    console.log(stock,"uuuuuuuu"); 
    // Check if the product is present in the cart
    if (cartIndex === -1) {
      return res.json({        
        success: false,
        message: "Product not found in the cart",
      });
    }

   
    // Increment the product quantity and save the cart
    cart.products[cartIndex].quantity -= 1;
    await cart.save();

    // Calculate the total price for the product and get the remaining quantity
    const product = cart.products[cartIndex].productId;
    const total = cart.products[cartIndex].stock * product.price;
    const remain = product.stock - cart.products[cartIndex].stock;
       console.log(cart.products[cartIndex].stock, "jjjjjj");
    res.json({
      success: true,
      total,
      stock: cart.products[cartIndex].stock,
      mess: remain > 0 ? remain : "out of stock",
      quantity:cart.products[cartIndex].quantity,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Failed to update quantity" });
  }
};
  
const deleteCartItem = async (req, res) => {
  const productId = req.params.id; // Correctly get productId from URL parameter

  try {
    const userId = req.session.user?.id;
    const productDeleted = await Cart.findOneAndUpdate(
      { userId: userId }, // Correct field name is userId
      { $pull: { products: { productId: productId } } },
      { new: true }
    );

    if (productDeleted) {
      res.redirect("/cart");
    } else {
      console.log("Product not deleted");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//checkout
const checkout = async (req, res) => {
  const user = req.session.user;
  
  try {
    const userId = req.session.user.id;  
    if (!userId) {
      return res.redirect("/login");
    }
    
    const data = await User.findOne({ _id: userId });
    const addresses = await Address.find({ user: userId });
    const address = addresses.map(addressItem => addressItem.deliveryAddress);

    const cart = await Cart.findOne({ userId: userId }).populate(
      "products.productId"
    );
    if (!cart) {
      return res.render("cart", { user });
    }

    const items = cart.products.map((item) => {
      const product = item.productId;
      const quantity = item.quantity;
      const price = product.price;
      if (!price) {
        throw new Error("product price is required");
      }

      if (!product) {
        throw new Error("Product is required");
      }
      return {
        product: product._id,
        quantity: quantity,
        price: price,
      };
    });
    let totalPrice = 0;
    items.forEach((item) => {
      totalPrice += (item.price * item.quantity);
    });
    const upcart = await Cart.findOneAndUpdate(
      { userId: userId },
      { total: totalPrice }
    );
    if (cart) {
      const products = cart.products;
      let currentDate = new Date();
      currentDate = currentDate.toISOString().substr(0, 10);

      res.render("checkout", {
        currentDate,
        upcart,
        products,
        // data: data.Address,
        totalPrice,
        address,
        userId: userId,
        addressItem: addresses,
      });
    }
  } catch (error) {
    console.log(error);
    
  }
}



module.exports = {
  addToCart,
  userCart,
  incrementQuantity,
  decrementQuantity,
  deleteCartItem,
  checkout,
  
};
