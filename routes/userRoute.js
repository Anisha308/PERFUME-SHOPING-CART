const express = require("express");
const user_route = express();
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);


const nocache = require("nocache");
user_route.use(nocache());

const config = require("../config/config");

const auth = require("../middleware/auth");

user_route.set("view engine", "ejs");
user_route.set("views", "./views/users");

user_route.use(express.json());
user_route.use(express.urlencoded({ extended: true }));
// user_route.use(express.static(__dirname+'/public/users'))

const userController = require("../controllers/userControllers");
const addressController = require("../controllers/addressController");
// Configure MongoDB session store
const store = new MongoDBStore({
  uri: "mongodb://127.0.0.1:27017/fragrancia",
  collection: "sessions" 
});

store.on("error", function (error) {
  console.log("MongoDB session store connection error: ", error);
});
 

user_route.use(
  session({
    secret: config.sessionSecret,
    saveUninitialized: true,
    resave: false,
    store: store
  })
);

const quantityController = require("../controllers/quantityControllers")




user_route.get("/register", auth.isLogout, userController.loadRegister);
user_route.post("/register", userController.insertUser);

// user_route.get('/',auth.isLogout,userController.loginLoad)
user_route.get("/login", auth.isLogout, userController.loginLoad);
user_route.post("/login", userController.verifyLogin);

user_route.get("/", userController.loadHome);
user_route.get("/home", userController.loadHome);

user_route.get(
  "/verifyotp",
  auth.isLogout,
  userController.startOtpTimer,
  userController.loadVerifyOTP
);
const orderController=require('../controllers/orderController')
const cartController = require("../controllers/cartController");
user_route.post("/verifyotp", userController.verifyOtp);
//resend OTP
user_route.get("/resend", auth.isLogout, userController.resendOtp);
user_route.get("/forgotResend", userController.forgotResendOtp);

//forgot password
user_route.get("/forgotpassword", userController.loadForgotPassword);
user_route.post("/forgotpassword", userController.forgotVerifyNumber);
 
//change password
user_route.get("/changepassword", userController.showchangePassword);
user_route.post('/changepassword',userController.changePassword)
// Load OTP verification page
user_route.get("/forgotOtpVerify", userController.loadOtpPage);

// Verify OTP and allow password reset
user_route.post("/forgotOtpVerify", userController.forgotOtpverify);

// Load reset password page
user_route.get("/resetpassword", userController.loadrewritePassword);

// Handle password reset

user_route.get("/showProduct", userController.showProduct);
user_route.get("/productdetail/:id", userController.productdetail);
user_route.get("/logout", userController.userLogout);


user_route.get("/profile",userController.loadUserProfile);
// user_route.get("/cart", cartController.addToCart);// Define the route to handle adding a product to the cart
user_route.get('/cart/:id', cartController.addToCart);
user_route.get("/cart", cartController.userCart);

user_route.post("/incrementQuantity", cartController.incrementQuantity);
user_route.post("/decrementQuantity", cartController.decrementQuantity);
user_route.get("/deleteCartItem/:id", cartController.deleteCartItem);
user_route.get("/checkout", cartController.checkout);


user_route.get('/address',addressController.user_Address) //to display the profile address  page
user_route.post("/addProfileaddress", addressController.addProfileAddress);
//add addresss


user_route.post("/addAddress", addressController.addAddress)
user_route.post('/placeOrder/:id', orderController.placeOrder);

user_route.get("/delete",auth.isLogin, addressController.pdeleteAddress);

//orerlist

user_route.get("/orderList", orderController.order_List);
user_route.get("/UserorderUpdate/:id", orderController.UserorderUpdate);

user_route.post("/edit-address", addressController.editProfileAddress);
user_route.post("/cancelOrder/:id",orderController.cancelUserOrder);


user_route.post('/editprofile',userController.editProfile)
module.exports = user_route;
