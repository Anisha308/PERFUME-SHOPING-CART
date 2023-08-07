
const express = require("express");
const admin_route = express();
const session = require("express-session");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });
const multipleUpload = upload.fields([
  { name: "image1", maxCount: 1 },
  { name: "image2", maxCount: 1 },
  { name: "image3", maxCount: 1 },
]);

const nocache = require("nocache");
admin_route.use(nocache());

const config = require("../config/config");

const adminauth = require("../middleware/adminauth");

admin_route.set("view engine", "ejs");
admin_route.set("views", "./views/admin");

admin_route.use(express.json());
admin_route.use(express.urlencoded({ extended: true }));

const adminControllers = require("../controllers/adminControllers");
const productController = require("../controllers/productController");
const categoryController = require("../controllers/categoryControllers");
const quantityController = require('../controllers/quantityControllers')
const orderController = require('../controllers/orderController')
const addressController = require('../controllers/addressController')
admin_route.use(
  session({
    secret: config.sessionSecret,
    saveUninitialized: true,
    resave: false,
  })
);


admin_route.get(
  "/adminlogin",
  adminauth.isAdminLogout,
  adminControllers.loadlogin
);
admin_route.post("/adminlogin", adminControllers.verifyadminLogin);
admin_route.get(
  "/dashboard",
  adminauth.isAdminLogin,
  adminControllers.loadDashboard
);

admin_route.get(
  "/adminhome",
  adminauth.isAdminLogin,
  adminControllers.loadHome
);
admin_route.get("/loadUser", adminauth.isAdminLogin, adminControllers.loadUser);

admin_route.get("/blockUser", adminControllers.blockUser);
admin_route.get("/unBlockUser", adminControllers.unBlockUser);

admin_route.get("/loadCategory", categoryController.loadCategory);
admin_route.post("/addCategory", categoryController.addCategory);
admin_route.get("/addCategory", categoryController.showCategory);
admin_route.get("/editcategories", categoryController.loadUpdateCategory);
admin_route.post("/editcategories", categoryController.updateCategory);
admin_route.get("/changestatus", categoryController.changeStatus);

//productlist

admin_route.get("/productList", productController.loadProductList);
admin_route.get("/addProduct",productController.showAddProduct)
admin_route.post("/addProduct", productController.createProduct);
admin_route.get("/changeProductstatus", productController.changeStatus);

admin_route.get("/editProductList", productController.editProductList);

admin_route.get("/deleteProduct", productController.deleteProduct);
admin_route.get("/adminlogout", adminControllers.adminlogout);

admin_route.post(
  "/updateProductList",
  multipleUpload,
  productController.updateProductList
);

admin_route.get("/addquantity", quantityController.displayAddQuantity);
admin_route.post('/addquantity',quantityController.addQuantity)

admin_route.get('/showquantity', quantityController.showQuantity)

admin_route.get('/displayOrder',orderController.order_status)
admin_route.post("/orderUpdate/:id", orderController.orderUpdate);
admin_route.post('/cancelOrder/:id',orderController.cancelUserOrder);

// admin_route.post("/edit-address/:id", addressController.editProfileAddress);

module.exports = admin_route;
