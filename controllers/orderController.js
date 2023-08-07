const Order = require("../models/ordermodel");
const Cart = require("../models/cartmodel");
const Product = require("../models/productmodel");
const Address = require("../models/addressmodell");

const placeOrder = async (req, res) => {
  try {
    const userId = req.session?.user?.id;
    console.log("......userId", userId);
    console.log("req.body", req.body);

    // Receive the payment_method and addressId from the frontend form
    const { selectedPaymentMethod, selectedAddressId } = req.body;
    console.log("///////payment", selectedPaymentMethod);
    console.log("///////addressId", selectedAddressId);

    // Fetch the user's address using the correct userId
    const addressSchema = await Address.findOne({ user: userId });
    console.log(addressSchema);

    const deliveryAddress = addressSchema.deliveryAddress;
    if (!deliveryAddress || !Array.isArray(deliveryAddress)) {
      throw new Error("User address data is invalid.");
    }

    // Find the index of the address that matches the provided id
    const addressIndex = deliveryAddress.findIndex(
      (item) => item._id.toString() === selectedAddressId
    );

    if (addressIndex === -1) {
      throw new Error("Address not found for the given user and id.");
    }

    const address = deliveryAddress[addressIndex];

    const cart = await Cart.findOne({ userId: userId }).populate(
      "products.productId"
    );
    const items = cart.products.map((item) => {
      const product = item.productId;
      const quantity = item.quantity;             
      const price = product.price;
      if (!price) {
        throw new Error("Product price is required");
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

    items.forEach(async (item) => {
      const pro = await Product.findById(item.product);
      const quan = pro.quantity - item.quantity;
      await Product.findByIdAndUpdate(item.product, { quantity: quan });
    });

    let totalPrice = cart.total;
    const order = new Order({
      user: userId,
      items: items,
      total: totalPrice,
      status: "Pending",
      payment_method: selectedPaymentMethod,
      createdAt: new Date(),
      address: address,
    });

    console.log(order, "kkkkooooooorooooooooooooooooooor");

    await order.save();
    //await Cart.deleteOne({ userId: userId });

    

    if (selectedPaymentMethod === "cash on delivery") {
      // Send a JSON response indicating success for cash on delivery
      res.render("confirm")
      // res
      //   .status(200) // Change the status code to 200
      //   .json({ success: true, message: "Order placed successfully." });
    } else {
      // Send a JSON response indicating success for other payment methods
      res
        .status(200) // Change the status code to 200
        .json({ success: true, message: "Order placed successfully." });
    }

  } catch (error) {
    console.log(error.message);
    // Send a JSON response indicating failure with an error message
    res.status(500).json({ success: false, error: error.message });
  }
};


//order page in admin side
const order_status = async (req, res) => {
    try {
        const order_data = await Order.find().populate("user").populate('items.product').populate('items.quantity')
        res.render('order_admstatus', { order_data })
    
    
    } catch (error) {
        console.log(error.message);
    }
}

// order adminupdate
const orderUpdate = async (req, res) => {
  try {
    console.log("its qokringngnbgngn");
    console.log(req.params, "ppppppppppppppppppppppp");
    console.log(req.body,"oooooooooooooooo");
    const orderId = req.params.id;
    const newStatus = req.body.status;
    console.log(newStatus, 'hoooo')
     console.log(orderId, "orderId");

    // Update the order using findByIdAndUpdate
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { $set: { status: newStatus } },
      { new: true } // Return the updated document
    );

    if (!updatedOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    }

    res
      .status(200)
      .json({ success: true, message: "Order status updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    // Find the order by ID
    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    }

    // Update the order status to "Cancelled"
    await Order.findByIdAndUpdate(orderId, { status: "Cancelled" });

    res
      .status(200)
      .json({ success: true, message: "Order cancelled successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

//user orderList

//order page in admin side
const order_List = async (req, res) => {
    try {
        const order_data = await Order.find().populate("user").populate('items.product').populate('items.quantity')
        res.render('userorderlist', { order_data })
    
    
    } catch (error) {
        console.log(error.message);
    }
}

//order  user update
const UserorderUpdate = async (req, res) => {
  try {
    const orderId = req.params.id;
    
    const newStatus = req.body.status;

    // Update the order using findByIdAndUpdate
    await orderSchema.findByIdAndUpdate(orderId, { status: newStatus });

    res.redirect("/UserorderUpdate");
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

//usercancelorder
const cancelUserOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    // Find the order by ID
    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    }

    // Update the order status to "Cancelled"
    await Order.findByIdAndUpdate(orderId, { status: "Cancelled" });

    res
      .status(200)
      .json({ success: true, message: "Order cancelled successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  placeOrder,
  order_status,
  orderUpdate,
  cancelOrder,
  order_List,
  UserorderUpdate,
  cancelUserOrder,
};
