const cartModel = require("../models/cartModel")
const productModel = require("../models/productModel")
const valid = require("../validators/userValidator")


const createCart = async function (req, res){
    try {
        let userId = req.params.userId
        let productId = req.body.productId
        let cartId = req.body.cartId
        let data = req.body

        if (!Object.keys(data).every((elem) => ["productId","cartId"].includes(elem))) {
            return res.status(400).send({ status: false, message: "only productId and cartId keys allowed" })
        }

        if (!valid.isValidId(productId) || !productId) {
            return res.status(400).send({ status: false, message: "productId should be valid or required" })
        }

        const checkProduct = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!checkProduct) {
            return res.status(404).send({ status: false, message: "no such product exist" })
        }

        const checkCart = await cartModel.findOne({ userId })
        // if user has no cart the we will create a new cart for him/her

        if (checkCart)
            if (cartId != checkCart._id)
                return res.status(400).send({ status: false, message: "pls send cartId and it should be of given user" })

        let cartItems = {}
        cartItems.userId = userId
        //cart does not exist
        if (!checkCart) {
            cartItems.items = { productId: productId, quantity: 1 }
            cartItems.totalPrice = checkProduct.price
            cartItems.totalItems = 1
        }
        else {
            let match = checkCart.items.filter((elem) => elem.productId == productId)
            let nomatch = checkCart.items.filter((elem) => elem.productId != productId)
            //cart exists but product does not
            if (match.length == 0) {
                checkCart.items.push({ productId, quantity: 1 })
                cartItems.items = checkCart.items
                cartItems.totalPrice = checkProduct.price + checkCart.totalPrice
                cartItems.totalItems = 1 + checkCart.totalItems

            }
            //cart exists and product also exists
            else {
                match[0].quantity = match[0].quantity + 1
                nomatch.push(match[0])
                cartItems.items = nomatch
                cartItems.totalPrice = checkProduct.price + checkCart.totalPrice
                cartItems.totalItems = checkCart.totalItems

            }

        }
        let newCartCreation = await cartModel.findOneAndUpdate({ userId: userId }, cartItems, { new: true, upsert: true }).populate('items.productId')
        return res.status(201).send({ status: true, message: "Success", data: newCartCreation })

    }
    catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}


const getCart = async function (req, res) {
    try {
        let userId = req.params.userId

        // getting cart summary by using populate method..... and we have to return products details also
        let checkCart = await cartModel.findOne({ userId }).populate("items.productId")
        if (!checkCart) {
            return res.status(404).send({ status: false, message: "no such cart found with this userId" })
        }

        return res.status(200).send({ status: true, message: "Success", data: checkCart })

    }


    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

const updateCart = async function (req, res) {
    try {

        const userId = req.params.userId
        const data = req.body
        const { cartId, productId, removeProduct } = data

        if (!Object.keys(data).every((elem) => ["productId","cartId","removeProduct"].includes(elem))) {
            return res.status(400).send({ status: false, message: "only productId, cartId and removeProduct keys allowed" })
        }

        if (!Object.keys(data).length === 0) {
            return res.status(400).send({ status: false, message: "no such data found to update" })
        }
        if (!valid.isValidId(cartId) ) {
            return res.status(400).send({ status: false, message: "cartId should be valid or required" })
        }
        if (!valid.isValidId(productId) ) {
            return res.status(400).send({ status: false, message: "productId should be valid or required" })
        }

        const checkCart = await cartModel.findOne({ _id: cartId, userId: userId })
        if (!checkCart) {
            return res.status(404).send({ status: false, message: "no such cart exist with the given cartId and userId" })
        }
        const checkProduct = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!checkProduct) {
            return res.status(404).send({ status: false, message: "no such product exist with the given productId" })
        }

        let updatedCartItem=null

        let match = checkCart.items.filter((elem) => elem.productId == productId)
        let nomatch = checkCart.items.filter((elem) => elem.productId != productId)
        if(removeProduct!=0 && removeProduct!=1)
        return res.status(400).send({ status: false, message: "invalid value in removeproduct" })

        if (match.length!=0) {
            let Price = match[0].quantity * checkProduct.price
            if (removeProduct == 0 || match[0].quantity == 1) {
                    updatedCartItem = await cartModel.findOneAndUpdate({ _id: cartId },
                    {
                        $set: {
                            items: nomatch,
                            totalPrice: checkCart.totalPrice - Price,
                            totalItems: checkCart.totalItems - 1,
                        }
                    }, { new: true }
                ).populate('items.productId')
            }

        else if (removeProduct == 1) {
                let product = {productId:productId,quantity:match[0].quantity-1}
                nomatch.push(product)
                    updatedCartItem = await cartModel.findOneAndUpdate(
                    { _id: cartId },
                    {
                        $set: { items: nomatch ,
                        totalPrice: checkCart.totalPrice - checkProduct.price,
                        totalItems: checkCart.totalItems ,
                        }
                    }, { new: true }
                ).populate('items.productId')
        }
        }
        else{
            return res.status(404).send({ status: false, message: "product doesn't exist in cart" })
        }

            return res.status(200).send({ status: true, message: "Success", data: updatedCartItem })
        }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}



const deleteCart = async function (req, res) {

    try {
        let userId = req.params.userId

        let checkCart =await cartModel.findOne({ userId})
        if(!checkCart.totalItems)
        return res.status(404).send({status:false,message:"Cart already empty"})

        await cartModel.findOneAndUpdate({ userId }, { items: [] ,
            totalPrice: 0,
            totalItems: 0 ,
            })
        
        return res.status(204).send()

    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }

}



module.exports = { createCart, getCart, updateCart,deleteCart }