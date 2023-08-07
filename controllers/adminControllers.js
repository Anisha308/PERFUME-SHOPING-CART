const admin = require('../models/adminmodel');
const User = require('../models/usermodel');
const Order=require('../models/ordermodel')
const bcrypt = require('bcrypt');

//load login page 

const loadlogin = async (req, res) => {
    try {
        res.render('adminlogin')
    }
    catch (error) {
        console.log(error.message)
    }
}

//load dashboard
const loadDashboard = async (req, res) => {
    try {
        res.render('dashboard')
    } catch (error) {
        console.log(error.message)
    }
}

const verifyadminLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const adminData = await admin.findOne({ email: email })
        if (adminData.password === password) {
            if (adminData) {
                req.session.admin_id = adminData._id
                res.redirect('/dashboard')



            } else {
                res.render('adminlogin', { message: "email or password is incorrect" })
            }
        }
        else {
            res.render('adminlogin', { message: "Email and password is incorrect" })
        }
    } catch (error) {
        console.log(error.message)
    }
}

const loadHome = async (req, res) => {
  try {
    // Assuming you have some logic to check if the user is authenticated
    const isAuthenticated = true; // Modify this logic based on your authentication mechanism

    if (isAuthenticated) {
      // If the user is authenticated, fetch the user data and render the 'adminhome' page
      const users = await User.find(); // Modify this query based on your database schema
      res.render("adminhome", { user: users });
    } else {
      // If the user is not authenticated, redirect to the 'adminlogin' page
      res.redirect("/adminlogin");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadUser = async (req, res) => {
    try {
        var search = "";
        if (req.query.search) {
            search = req.query.search
        }
        const userData = await User.find({
            $or: [
                { name: { $regex: '.*' + search + '.*' } },
                { email: { $regex: '.*' + search + '.*' } },
                { mobile: { $regex: '.*' + search + '.*' } },
            ]

        });

        res.render('adminhome', { user: userData })
    } catch (error) {
        console.log(error.message)
    }
};

const adminlogout = async (req, res) => {
    try {
        req.session.destroy()
        res.redirect('/adminlogin')
    } catch (error) {
        console.log(error.message);
    }
}

//blockuser

const blockUser = async (req, res) => {
    try {
        const id = req.query.id;
        await User.findByIdAndUpdate({ _id: id }, { $set: { is_blocked: true } })
        // req.session.destroy()
        res.redirect("/loadUser")


    } catch (error) {
        console.log(error.message)
    }
};

const unBlockUser = async (req, res) => {
    try {
        const id = req.query.id;
        await User.findByIdAndUpdate({ _id: id }, { $set: { is_blocked: false } })
        res.redirect("/loadUser")

    } catch (error) {
        console.log(error.message)
    }
};







module.exports = {
  loadlogin,
  verifyadminLogin,
  loadDashboard,
  loadHome,
  loadUser,
  adminlogout,
  blockUser,
  unBlockUser,
  
};