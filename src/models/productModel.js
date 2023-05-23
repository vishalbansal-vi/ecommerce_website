const mongoose = require("mongoose")


const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        trim: true
        //  valid number/decimal
    },
    currencyId: {
        type: String,
        required: true,
        trim: true,
        default: "INR"
        //  INR
    },
    currencyFormat: {
        type: String,
        trim: true,
        required: true,
        default: "₹"
        //  Rupee symbol
    },
    isFreeShipping: {
        type: Boolean,
        default: false,
        trim: true
    },
    productImage: {
        type: String,
        required: true,
        trim: true
    },  // s3 link
    style: {
        type: String,
        trim: true
    },
    availableSizes: {
        // array of string, at least one size,
        type: [String],
        trim: true,
    },
    installments: {
        type: Number,
        trim: true
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
    }

}, { timestamps: true })

module.exports = mongoose.model("product", productSchema)