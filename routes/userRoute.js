const express = require('express')
const user_route = express();
const session = require('express-session')

const nocache = require('nocache')
user_route.use(nocache())

const config = require('../config/config')

const auth = require('../middleware/auth')

user_route.set('view engine', 'ejs')
user_route.set('views', './views/users')



user_route.use(express.json())
user_route.use(express.urlencoded({ extended: true }))
// user_route.use(express.static(__dirname+'/public/users'))

const userController = require('../controllers/userControllers')
user_route.use(session({
    secret: config.sessionSecret,
    saveUninitialized: true,
    resave: false
}))

user_route.get('/register', auth.isLogout, userController.loadRegister)
user_route.post('/register', userController.insertUser)

// user_route.get('/',auth.isLogout,userController.loginLoad)
user_route.get('/login', auth.isLogout, userController.loginLoad)
user_route.post('/login', userController.verifyLogin)

user_route.get('/', userController.loadHome)
user_route.get('/home', userController.loadHome)

user_route.get('/verifyotp', auth.isLogout, userController.startOtpTimer, userController.loadVerifyOTP)
user_route.post('/verifyotp', userController.verifyOtp);
//resend OTP
user_route.get('/resend', auth.isLogout, userController.resendOtp)

//forgot password
user_route.get('/forgotpassword', userController.loadForgotPassword)
user_route.post('/forgotpassword', userController.forgotVerifyNumber)



// Load OTP verification page
user_route.get('/forgotOtpVerify',userController. loadOtpPage);

// Verify OTP and allow password reset
user_route.post('/forgotOtpVerify',userController. forgotOtpverify);

// Load reset password page
user_route.get('/resetpassword', userController.loadrewritePassword);

// Handle password reset
// user_route.post('/resetpassword', userController.resetPassword);

user_route.get('/logout', userController.userLogout)
module.exports = user_route
// user_route.get('/forgotNumber', userController.loadOtpPage)
// user_route.post('/forgototp', userController.forgotOtpverify)
