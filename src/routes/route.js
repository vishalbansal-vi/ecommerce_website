const express = require("express")
const  router = express.Router()
const userController = require("../controllers/userController")
const productController = require("../controllers/productController")
const cartController = require("../controllers/cartController")
const orderController = require("../controllers/orderController")
const auth = require("../middleWares/auth")


//==============================user=====================================================//

router.post("/register", userController.createUser)
router.post("/login", userController.loginUser)
router.get("/user/:userId/profile",auth.Authentication,auth.Authorization,userController.getUserbyId)
router.put("/user/:userId/profile",auth.Authentication,auth.Authorization, userController.updateUser)

//===============================products=================================================//

router.post("/products", productController.createProduct)
router.get("/products",productController.getProducts)
router.get("/products/:productId", productController.getProducstById)
router.put("/products/:productId", productController.updateProduct)
router.delete("/products/:productId", productController.deleteProduct)

//===============================cart=================================================//

router.post("/users/:userId/cart",auth.Authentication,auth.Authorization,cartController.createCart)
router.get("/users/:userId/cart",auth.Authentication,auth.Authorization,cartController.getCart)
router.put("/users/:userId/cart",auth.Authentication,auth.Authorization,cartController.updateCart)
router.delete("/users/:userId/cart",auth.Authentication,auth.Authorization,cartController.deleteCart)

//===============================order=================================================//

router.put("/users/:userId/orders",auth.Authentication,auth.Authorization,orderController.updateOrder)

router.post("/users/:userId/orders",auth.Authentication,auth.Authorization,orderController.createOrder)




module.exports = router
