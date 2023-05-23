const cartModel = require("../models/cartModel")
const orderModel = require("../models/orderModel")
const valid = require("../validators/userValidator")

const createOrder = async function (req,res){
    try{
        let userId = req.params.userId
        let cartId = req.body.cartId
        let data = req.body

        if (!Object.keys(data).every((elem) => ["cancellable","cartId"].includes(elem))) {
            return res.status(400).send({ status: false, message: "only cancellable and cartId keys allowed" })
        }

        if(!valid.isValidId(cartId)){
            return res.status(400).send({status: false, message: "cartId is not valid and required"})
        }
        if(data.cancellable!=undefined){
            if(typeof data.cancellable != "boolean")
            return res.status(400).send({status: false, message: "Cancellable should be boolean "})
        }
        const checkCart = await cartModel.findOne({_id: cartId, userId: userId}).populate('items.productId')
        if(!checkCart){
            return res.status(400).send({status: false, message: "no such cart exist with this cartId and userId"})
        }
        if(!checkCart.items.length){
            return res.status(400).send({status: false, message: "bro, you can't order with empty cart..."})
        }
        let total = 0
        checkCart.items.forEach(element => total += element.quantity)
        let placeOrder = {}
        placeOrder.userId = userId
        placeOrder.items = checkCart.items
        placeOrder.totalItems = checkCart.totalItems
        placeOrder.totalPrice = checkCart.totalPrice
        placeOrder.totalQuantity = total
        placeOrder.cancellable = data.cancellable
        placeOrder.status = "pending" //it will be updated from updated api

        let orderData = await orderModel.create(placeOrder)
        let order  = orderData.toObject()
        order.items =checkCart.items
 
        await cartModel.findOneAndUpdate({_id: cartId, userId: userId},{items: [] ,
            totalPrice: 0,
            totalItems: 0 })

         return res.status(201).send({status: true, message: "Success", data: order})
        

    }
    catch(error){
        return res.status(500).send({message: error.message})
    }
}

 const updateOrder = async function(req,res)
{
    try
    {
        const orderId = req.body.orderId
        const status = req.body.status
        const userId = req.params.userId
        const data = req.body

        if (!Object.keys(data).every((elem) => ["orderId","status"].includes(elem))) {
            return res.status(400).send({ status: false, message: "only orderId and status keys allowed" })
        }
        if (!["completed", "cancelled"].includes(status)) {
            return res.status(400).send({status:false,message:"pls send correct status, only [completed,cancelled] allowed"})
        }

        if (!valid.isValidId(orderId)) {
            return res.status(400).send({ status: false, message: "OrderId should be valid and required" })
        }
        const checkOrder = await orderModel.findOne({ _id:orderId, userId })
        if(!checkOrder)
        return res.status(404).send({status:false,message:"Order does not exist"})

        if(checkOrder.cancellable!=true && status=="cancelled")
        return res.status(400).send({status:false,message:"Order is not cancellable"})

        if(checkOrder.status == status)
        return res.status(400).send({status:false, message:"Already done. Give different input"})

        let updatedOrder = await orderModel.findOneAndUpdate({ _id: orderId,userId },{status},{new:true}).populate('items.productId')
       
        return res.status(200).send({ status: true, message: "Success", data:updatedOrder })

    }
    catch(err)
    {
        return res.status(500).send({status:false,message:err.message})
    }
}

module.exports= {createOrder,updateOrder}