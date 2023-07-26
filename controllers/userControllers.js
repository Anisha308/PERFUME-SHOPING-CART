const { UserDefinedMessageListInstance } = require('twilio/lib/rest/api/v2010/account/call/userDefinedMessage');
const User = require('../models/usermodel');
const Product = require('../models/productmodel')
const bcrypt = require('bcrypt');

const Quantity = require('../models/quantitymodel')


const twilio = require('twilio')
const dotenv = require("dotenv");
dotenv.config();
const accountSid = process.env.accountSid;
const authToken = process.env.authToken;
const twilioNumber = process.env.twilioNumber;
const client = twilio(accountSid, authToken);
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

const loadRegister = async (req, res) => {
  try {
    res.render('register');
  } catch (error) {
    console.log(error);
  }
};

const insertUser = async (req, res) => {
  try {
    const { email,District,pincode,HouseName,password } = req.body;
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.render("register", { message: "Email already exists" });
    }


    const spassword = await securePassword(req.body.password);
    const addressData = {
      District,
      pincode,
      HouseName
    };

    // const addressData = {
    //   District,
    //   pincode,
    //   HouseName
    // }

    const user = new User({
      username: req.body.name,
      email: req.body.email,
      mobile: req.body.mobile,
      Address: [addressData], // Store the address object in an array
      password: spassword,
    });

    

    // Validation

    if (!user.mobile || !user.password) {
      return res.render("register", {
        message: "Mobile number and password must be filled",
      });
    }

    if (!/^\d{10}$/.test(req.body.mobile)) {
      return res.render("register", {
        message: "Mobile number must be 10 digits",
      });
    }
    if (!/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(req.body.email)) {
      return res.render("register", { message: "Invalid email format" });
    }

    if (/\d/.test(req.body.name)) {
      return res.render("register", {
        message: "Name should not contain numbers",
      });
    }

    if (req.body.password !== req.body.confirmPassword) {
      return res.render("register", { message: "Passwords do not match" });
    }

    if (!user.username || !user.email || !user.mobile || !user.Address[0].District || !user.Address[0].pincode || !user.Address[0].HouseName) {
      return res.render("register", { message: "all fields should be filled" });
    }
    // Generate a random OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    console.log(otp);

    // Send the OTP to the user's mobile number
    // await twilio.messages.create({
    //   body: `Your OTP: ${otp}`,
    //   from: 'TwilioNumber',
    //   to: `+91${user.mobile}`,
    // })

    // Store the OTP and user data in the session
    req.session.otp = otp;
    req.session.user_id = user._id;
    req.session.user = {
      username: user.username,
      email: user.email,
      mobile: user.mobile,
      Address:user.Address,
      password: user.password,
    };
// console.log(req.session.user)
    res.render("verifyotp");
  } catch (error) {
    console.log(error.message);
    return res.render("register", { message: "an error occured" });
  }
};

const loadVerifyOTP = async (req, res) => {
  try {
    otpTimer = req.session.otpTimer || 0; // Get the OTP timer value from the session
    res.render("verifyotp", { otpTimer }); // Pass otpTimer as a local variable to the view
  } catch (error) {
    console.log(error.message);
  }
};
// Login user method
const loginLoad = async (req, res) => {
  try {
    res.render('login');
  } catch (error) {
    console.log(error.message);
  }
};




//otp timer
const startOtpTimer = (req, res, next) => {
  const otpExpiryTime = 1 * 60 * 1000;//Set OTP expiry time to 1 minutes (in milliseconds)
  // Set the OTP timer in the session
  if (!req.session.otpTimer) {
    req.session.otpTimer = otpExpiryTime;

    // Start the timer
    setTimeout(() => {
      req.session.otpTimer = undefined;// Clear the OTP timer after expiry
    }, otpExpiryTime);
  }
  next();
}

const verifyOtp = async (req, res) => {
  try {
    const otp = req.body.otp;
    if (otp == req.session.otp) {
      // OTP is correct, proceed with login
      const userData = req.session.user;
      req.session.user_id = req.session.user_id;
      req.session.otp = undefined; // Clear OTP after successful verification
      const user = new User({
        username: userData.username,
        email: userData.email,
        mobile: userData.mobile,
        Address:userData.Address,
        password: userData.password,
        is_admin: userData.is_admin,
      });

      await user.save();
      // return res.redirect('/login');
      return res.render('login', { message: 'Register successful' });
    } else {
      // Incorrect OTP
      return res.render('verifyotp', { message: 'Incorrect OTP' });
    }
  } catch (error) {
    console.log(error.message);
    return res.render('verifyotp', { message: 'An error occurred' });
  }
};


//Resend Otp

const resendOtp = async (req, res) => {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000);
    console.log(otp);
    // Store the OTP and user data in the session
    req.session.otp = otp;
    const userData = req.session.user

    if (!userData) {
      res.status(400).json({ message: "Invalid or expired session" });
    }
    req.session.user = {
      username: userData.name,
      email: userData.email,
      mobile: userData.mobile,
      Address: userData.Address,
      password: userData.password,
      is_admin: userData.is_admin,
    };

    res.render('verifyotp', { message: "OTP resent successfully" });
  } catch (error) {
    console.log(error.message);
    return res.render("register", { message: "All fields should be filled" });
  }
}



// const verifyLogin = async (req, res) => {
//   try {
//     const emailRegex = /^([a-zA-Z0-9\._]+)@([a-zA-Z0-9]+)\.([a-z]+)(\.[a-z]+)?$/;
//     const email = req.body.email;
//     const password = req.body.password;
//     if (!email) {
//       return res.render('login', { message: "Email must be filled" });
//     }
//     if (!emailRegex.test(email)) {
//       return res.render('login', { message: "Invalid email format" });
//     }
//     if (!email || !password) {
//       return res.render('login', { message: "Email and password are required" });
//     }
//     if (!password) {
//       return res.render('login', { message: "Password must be filled" });
//     }
//     const userData = await User.findOne({ email: email });
//     if (userData) {

//       if (userData.is_blocked) {
//         res.render('login', { message: "You are blocked from this site" })
//       }

//       const passwordMatch = await bcrypt.compare(password, userData.password);


//       if (passwordMatch) {
//         req.session.user = {
//           name: userData.name,
//           email: userData.email,
//           mobile: userData.mobile,
//            District: userData.District,
//       pincode: userData.pincode,
//       HouseName:userData.HouseName,
       
          
//         };
//         return res.redirect('/home');
//       } else {
//         return res.render('login', { message: "Email or password are incorrect" });
//       }
//     } else {
//       return res.render('login', { message: "Email or password are incorrect" });
//     }
//   } catch (error) {
//     console.log(error.message);
//   }
// };

const { validationResult } = require("express-validator");

const verifyLogin = async (req, res) => {
  try {
    // Validate form inputs using express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
    
      return res.redirect(
        "/login",
        "Invalid input. Please check your email and password."
      );
    }

    const { email, password } = req.body;

    const userData = await User.findOne({ email });

    if (!userData) {
     return res.render("login", { message: "Invalid email" });
    }

    if (userData.is_blocked) {
      res.render("login", { message: "You are blocked from this site" });
    }

    const passwordMatch = await bcrypt.compare(password, userData.password);

    if (!passwordMatch) {
       res.render("login", { message: "password is wrong" });
    }

    // Store relevant user data in the session (avoid storing the password)
    req.session.user_id = userData._id;
    req.session.user = {
      name: userData.name,
      email: userData.email,
      mobile: userData.mobile,
      District: userData.District,
      pincode: userData.pincode,
      HouseName: userData.HouseName,
      // Avoid storing the password here
    };

    return res.redirect("/home"); // Redirect to the home page after successful login
  } catch (error) {
     res.render("login", { message: "An error occured during login" });
  }
};


const loadHome = async (req, res) => {
  try {
    const User = req.session.user;
    res.render('home', { User });

  } catch (error) {
    console.log(error.message);
  }
};
const loadForgotPassword = async (req, res) => {
  try {
    res.render('forgotpassword');
  } catch (error) {
    console.log(error.message);
  }
};

const forgotVerifyNumber = async (req, res) => {
  try {
    req.session.mobile = req.body.mobile;
    const user = await User.findOne({ mobile: req.session.mobile });
    req.session.user = user;
    if (!user) {
      res.render('forgotpassword', { message: "user not registered" });
    } else {
      const forgototp = Math.floor(100000 + Math.random() * 900000);
      req.session.forgotOtp = forgototp;
      console.log(forgototp);
      res.render('forgotOtpVerify');
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadOtpPage = async (req, res) => {
  try {
    otpTimer = req.session.forgotOtpTimer || 0; // Get the OTP timer value from the session
    res.render("forgotOtpVerify", { otpTimer }); // Pass otpTimer as a local variable to the view
  } catch (error) {
    console.log(error.message);
  }
};

const forgotResendOtp = async (req, res) => {
  try {
    const resendOtp = Math.floor(100000 + Math.random() * 900000);
    console.log(resendOtp);
    req.session.forgotOtp = resendOtp;
    console.log("testing", req.session.forgotOtp);
    res.render("forgotOtpVerify", { message: "OTP has been resent.", otp: req.session.forgotOtp });
  } catch (error) {
    console.log(error.message);
  }
};


const forgotOtpverify = async (req, res) => {
  console.log("test2", req.session.forgotOtp);
  try {
    const otp = req.body.otp;
    console.log(otp);
    if (otp == req.session.forgotOtp) {
      // OTP is correct, proceed with login
      return res.render('resetpassword');
    } else {
      // Incorrect OTP
      return res.render('forgotOtpVerify', { message: "Incorrect OTP" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

  //reset password
const loadrewritePassword = async (req, res)=>{
  try {
    res.render('resetpassword')
  } catch (error) {
    console.log(error.message)
  }
  
}





const showProduct = async (req, res) => {
  try {
    const products = await Product.find({});
    // console.log(products);
    res.render("showProduct", { products });
  } catch (error) {
    console.log(error.message);
  }
};
// product detail

const productdetail = async (req, res) => {
  try {
    // console.log(req.params);
    const productId = req.params.id;
    const product = await Product.findOne({ _id: productId });
    // console.log(product);
    const sizeInfo = await Quantity.findOne({ product: productId });
    const sizes = sizeInfo ? sizeInfo.quantities.map((q)=> q.size): [];
    res.render("productdetail", { product,sizes });
  } catch (error) {
    console.log(error);
  }
};
//load user profile
// const loadUserProfile = async (req, res) => {
//   try {
//     if (!req.session.user) {
//       return res.redirect("/login");
//     }

//     const user_id = req.session.user_id;

//     const user = await User.findById(user_id);

//     if (!user) {
//       return res.redirect("/login");
//     }

//     res.redirect("profile", { user });
//   } catch (error) {
//     console.log(error.message);
//   }
// };

// ...................
// const loadUserProfile = async (req, res) => {
//   try {
//     if (!req.session.user) {
//       return res.redirect("/login");

//     }

//     const user_id = req.session.user_id;
//     const user = await User.findById(user_id);

//     if (!user) {
//       return res.redirect("/login");
//     }

//     res.render("profile", { user }); // Use res.render() to render the profile view with user data
//   } catch (error) {
//     console.log(error.message);
//   }
// };
// const loadUserProfile = async (req, res) => {
//   try {
//     console.log("User ID from session:", req.session.user_id); // Add this line to check the value



const loadUserProfile = async (req, res) => {
  try {
    // console.log("Session Data:", req.session);

    if (!req.session.user) {
      return res.redirect("/login");
    }

    const user_id = req.session.user_id;
    const user = await User.findById(user_id);

    if (!user) {
      return res.redirect("/login");
    }

    res.render("profile", { user });
  } catch (error) {
    console.log(error.message);
  }
};


const userLogout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect('/');
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadRegister,
  insertUser,
  loginLoad,
  verifyLogin,
  loadHome,
  loadVerifyOTP,
  userLogout,
  verifyOtp,
  resendOtp,
  startOtpTimer,
  loadForgotPassword,
  forgotVerifyNumber,
  forgotOtpverify,
  loadOtpPage,
  loadrewritePassword,
  showProduct,
  forgotResendOtp,
  productdetail,
  loadUserProfile
};
