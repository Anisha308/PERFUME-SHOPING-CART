const { UserBindingPage } = require("twilio/lib/rest/ipMessaging/v2/service/user/userBinding");
const Address = require("../models/addressmodell");
const User = require("../models/usermodel")


const addAddress = async (req, res) => {
  try {
    const userId = req.session.user?.id; 
   
    const newAddress = req.body;
    let deliveryAddress = {
      name: newAddress.name,
      mobile: newAddress.mobile,
      email: newAddress.email,
      address: newAddress.address,
      district: newAddress.district,
      state: newAddress.state,
      country: newAddress.country,
      pincode: newAddress.pincode,
    };

    const isAddress = await Address.findOne({ user: userId }); // Use the userId in the query

    if (isAddress) {
      await Address.updateOne(
        { user: userId }, 
        {
          $push: { deliveryAddress },
        }
      );
    } else {
      const newAddressInstance = new Address({
        user: userId, 
        deliveryAddress,
      });
      await newAddressInstance.save();
    }
    res.redirect("/checkout");
  } catch (error) {
    console.log(error);
  }
};
const addProfileAddress = async (req, res) => {
  try {
    const userId = req.session.user?.id;

    const newAddress = req.body;
    let deliveryAddress = {
      name: newAddress.name,
      mobile: newAddress.mobile,
      email: newAddress.email,
      address: newAddress.address,
      district: newAddress.district,
      state: newAddress.state,
      country: newAddress.country,
      pincode: newAddress.pincode,
    };

    const isAddress = await Address.findOne({ user: userId }); // Use the userId in the query

    if (isAddress) {
      await Address.updateOne(
        { user: userId },
        {
          $push: { deliveryAddress },
        }
      );
    } else {
      const newAddressInstance = new Address({
        user: userId,
        deliveryAddress,
      });
      await newAddressInstance.save();
    }
    res.redirect("/profile");
  } catch (error) {
    console.log(error);
  }
};

const user_Address = async (req, res) => {
  try {
    const user_id = req.session.user_id;
    const user = await User.findById(user_id);

    if (!user) {
      return res.redirect("/login");
    }
    const addressItem = await Address.find({ user: user_id });
    console.log("Address :", addressItem);
  
    res.render('address',{ user, addressItem })
  } catch (error) {
    console.log(error.message)
  }
}
    
const pdeleteAddress = async (req, res) => {
  try {
    const addId = req.query.id;
  
    const userId = req.session.user?.id.toString();
    console.log(userId);

    const foundUser = await Address.findOne({ user: userId });

    if (!foundUser) {
      return res.status(404).send("User not found");
    }

    // Find the index of the address to be deleted
    const addressIndex = await foundUser.deliveryAddress.findIndex(
      (addr) => addr._id.toString() === addId
    );

    // if (addressIndex === -1) {
    //   return res.status(404).send("Address not found");
    // }

    // Remove the address at the specified index
    foundUser.deliveryAddress.splice(addressIndex, 1);

    // Save the updated user
    const updatedUser = await foundUser.save();

    if (updatedUser) {
      res.redirect("/address");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

const editProfileAddress = async (req, res) => {
  
  try {
    const id = req.query.id;
  
    const userI = req.session.user?.id;
    const userid = userI.toString()
   
    const user = await Address.findOne({ user: userid });
   
    const addressIndex = user.deliveryAddress.findIndex(
      (address) => address._id.toString() === id
    );

    
    //update the address fields

    user.deliveryAddress[addressIndex].name = req.body.name;
    user.deliveryAddress[addressIndex].address = req.body.address;
    user.deliveryAddress[addressIndex].mobile = req.body.mobile;
    user.deliveryAddress[addressIndex].pincode = req.body.pincode;
    user.deliveryAddress[addressIndex].district = req.body.district;
    user.deliveryAddress[addressIndex].state = req.body.state;
   user.deliveryAddress[addressIndex].country = req.body.country;

    // Save the updated user object
    await user.save();
    
    res.redirect("/profile");
  } catch (error) {
    console.log(error);
    
  }
};

   module.exports = {
     addAddress,
     
     user_Address,
     addProfileAddress,
     pdeleteAddress,
     editProfileAddress,
   };
