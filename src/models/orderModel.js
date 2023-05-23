const mongoose = require("mongoose")
const ObjectId = mongoose.Schema.Types.ObjectId


const orderSchema = new mongoose.Schema({
    userId: {
        type: ObjectId,
        ref: "user",
        required: true,
        trim: true
    },
    items: [{
        productId: {
            type: ObjectId,
            ref: "product",
            required: true,
            trim: true
        },
        quantity: {
            type: Number,
            required: true,
            trim: true
            //  min 1
        }
    }],
    totalPrice: {
        type: Number,
        required: true,
        trim: true
        //  comment: "Holds total price of all the items in the cart"
    },
    totalItems: {
        type: Number,
        required: true,
        trim: true
        //  comment: "Holds total number of items in the cart"
    },
    totalQuantity: {
        type: Number,
        required: true,
        trim: true
        //  comment: "Holds total number of quantity in the cart"
    },
    cancellable: {
        type: Boolean,
        default: true,
        trim: true
    },
    status: {
        type: String,
        default: 'pending',
        trim: true,
        enum: ["pending", "completed", "cancelled"]
    },
    deletedAt: {
        type: Date,
        trim: true
        //  when the document is deleted
    },
    isDeleted: {
        type: Boolean,
        default: false,
        trim: true
    },



}, { timestamps: true })

module.exports = mongoose.model("order", orderSchema)