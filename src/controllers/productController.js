const awsCon = require("../controllers/awsController")
const productModel = require("../models/productModel")
const valid = require("../validators/userValidator")

//* PRODUCT valid *//

//------------------ size Validation----------------------->>
const isValidSize = (sizes) => {
    let sizesList = sizes.toUpperCase().split(",").map(x => x.trim());

    let arr = ["S", "XS", "M", "X", "L", "XXL", "XL"];
    if (!sizesList.every((elem) => arr.includes(elem))) {
        return true
    }
}

//--------------------boolean validation---------------------//
const isValidBoolean = (value) => {
    if (!( value == "true" || value=="false")) return true
    return false
}


const createProduct = async function (req, res) {
    try {
        let data = req.body
        let files = req.files

        if (!Object.keys(data).length && !files)
            return res.status(400).send({ status: false, message: "Send data in body" })

        let { title, description, price, currencyId, currencyFormat, isFreeShipping, productImage, style, availableSizes, installments } = data

        if (!valid.isValidate(title))
        return res.status(400).send({ status: false, message: "title is required or invalid" })
 
        let duplicateTitle = await productModel.findOne({ title: title});
        if (duplicateTitle) return res.status(409).send({ status: false, message: "title already exist in use" });

        if (!valid.isValidate(description))
            return res.status(400).send({ status: false, message: "description is required or invalid" })

        if (!valid.stringContainsAlphabet(price))
            return res.status(400).send({ status: false, message: "price is required or invalid" })

        if(installments!=undefined)
        if (!valid.stringContainsAlphabet(installments))
            return res.status(400).send({ status: false, message: "installments is required or invalid" })

        //will check style vali.
        if(style!=undefined)
        if (valid.isValidName(style))
            return res.status(400).send({ status: false, message: "style is  invalid" })
        if(isFreeShipping!=undefined)
        { if (isValidBoolean(isFreeShipping.trim()))
            return res.status(400).send({ status: false, message: "isFreeShipping is invalid" })
            data.isFreeShipping=isFreeShipping.trim()
        }
        if (files && files.length > 0 && (files[0].fieldname == "productImage" || files[0].fieldname == "image") ) {
            let url = await awsCon.uploadFile(files[0])
            data.productImage = url
        } else {
            return res.status(400).send({ status: false, message: "productImage is required or invalid" })
        }

        if (currencyId!=undefined)
        {
            currencyId = currencyId.trim()
            if(!valid.isValidate(currencyId)) return res.status(400).send({ status: false, message: "currencyId wrong format" });
            if (currencyId != 'INR') return res.status(400).send({ status: false, message: "only indian currencyId INR accepted" });
        }
        if (currencyFormat!=undefined)
        {
            currencyFormat=currencyFormat.trim()
            if (!valid.isValidate(currencyFormat.trim())) return res.status(400).send({ status: false, message: "currencySymbol wrong format" });
            if (currencyFormat != '₹') return res.status(400).send({ status: false, message: "only indian currency ₹ accepted " });
        }

        if (isValidSize(availableSizes)) return res.status(400).send({ status: false, message: "availableSizes is required or invalid" })

        // taking size as array of string 
        let sizesList = availableSizes.toUpperCase().split(",").map(x => x.trim());
        data.availableSizes = sizesList


        let savedData = await productModel.create(data)
        return res.status(201).send({ status: true, message: "Success", data: savedData })


    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }


}


const getProducstById = async function (req, res) {
    try {
        let productId = req.params.productId;

        if (!valid.isValidId(productId))
            return res.status(400).send({ status: false, message: "Invalid Product ID" });

        let getProduct = await productModel.findOne({_id:productId, isDeleted:false});

        if (!getProduct)
            return res.status(404).send({
                status: false,
                message: "ProductID not found ",
            });

        return res.status(200).send({ status: true, message: "Success", data: getProduct });

    }

    catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}


const getProducts = async function (req, res) {
    try {
        const query = req.query
        const body = { isDeleted: false }
        let data = null
        let check = 0

    if (!Object.keys(query).every((elem) => ["size", "name","priceGreaterThan", "priceLessThan","priceSort"].includes(elem))) {
        return res.status(400).send({ status: false, message: "wrong Parameters found" });
    }
    if(query.size!=undefined)
    {
        if (isValidSize(query.size))return res.status(400).send({ status: false, message: "availableSizes is required or invalid" })
        let sizesList = query.size.toUpperCase().split(",").map(x => x.trim());
        body.availableSizes = {$in:sizesList }
    }
    //handle empty string
    if(query.name!=undefined)
    {
        if(valid.isValidName(query.name))
        return res.status(400).send({ status: false, message: "name is invalid" })
        const regex =  new RegExp(query.name.trim(),'i')
        body.title = regex
    }

    if(query.priceGreaterThan!=undefined)
    if(!valid.stringContainsAlphabet(query.priceGreaterThan) ||
    parseInt(query.priceGreaterThan)<0)
    return res.status(400).send({ status: false, message: "Invalid priceGreaterThan provided" });       
    
    if(query.priceLessThan!=undefined)
    if(!valid.stringContainsAlphabet(query.priceLessThan) ||
    parseInt(query.priceLessThan)<0 )
    return res.status(400).send({ status: false, message: "Invalid priceLessThan provided" });       

    if(parseInt(query.priceGreaterThan)>=0 && parseInt(query.priceLessThan)>=0)
    {
        if(parseInt(query.priceGreaterThan)>parseInt(query.priceLessThan))
        return res.status(400).send({ status: false, message: "priceGreaterThan should be less than priceLessThan" });       
        body.price = { $gt: parseInt(query.priceGreaterThan), $lt: parseInt(query.priceLessThan)}
    }
        
    else if(parseInt(query.priceGreaterThan) >=0)
        body.price = { $gt: parseInt(query.priceGreaterThan)}
    else if(parseInt(query.priceLessThan)>=0)
        body.price = { $lt: parseInt(query.priceLessThan)}    

    
    if(query.priceSort!=undefined)
    {
    if (!["1","-1"].includes(query.priceSort)) {
        return res.status(400).send({ status: false, message: "wrong value in sort" });
    }

        check = 1
        data = await productModel.find(body).sort({ price: query.priceSort })

    }
        if (!check)
            data = await productModel.find(body)

        if (!data.length)
            return res.status(404).send({ status: false, message: "Products do not exist" })

        return res.status(200).send({ status: true,message:"Success", data: data })


    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }


}


const updateProduct = async function (req, res) {
    try {
        let productId = req.params.productId
        let data = req.body
        let files = req.files

        if (!valid.isValidId(productId))
            return res.status(400).send({ status: false, message: "Invalid Product ID" });

        let { title, description, price, currencyId, currencyFormat, isFreeShipping, productImage, style, availableSizes, installments } = data

        if (!Object.keys(data).length && !files)
            return res.status(400).send({ status: false, message: "Send data in body" })

        if (title != undefined) {
            if (!valid.isValidate(title))
                return res.status(400).send({ status: false, message: "title is invalid" })
        }
        const checkTitle = await productModel.findOne({ title: title})
        if (checkTitle) {
            return res.status(400).send({ status: false, message: "title already exists. Please try another." })
        }


        if (description != undefined) {
            if (!valid.isValidate(description))
                return res.status(400).send({ status: false, message: "description is invalid" })
        }

        if (price != undefined) {
            if (!valid.stringContainsAlphabet(price))
                return res.status(400).send({ status: false, message: "price is invalid" })
        }

        if (installments != undefined) {
            if (!valid.stringContainsAlphabet(installments))
                return res.status(400).send({ status: false, message: "installments is invalid" })
        }

        if (style != undefined) {
            if (valid.isValidName(style))
                return res.status(400).send({ status: false, message: "style is  invalid" })
        }

        if (isFreeShipping != undefined) {
            if (isValidBoolean(isFreeShipping))
                return res.status(400).send({ status: false, message: "isFreeShipping is invalid" })
        }

        if (files && files.length > 0 && (files[0].fieldname == "productImage" || files[0].fieldname == "image")) {
            let url = await awsCon.uploadFile(files[0])
            data.productImage = url
        }

        if (currencyId != undefined) {
            if (!valid.isValidate(currencyId)) return res.status(400).send({ status: false, message: "currencyId wrong format" });
            if (currencyId != 'INR') return res.status(400).send({ status: false, message: "only indian currencyId INR accepted" });
        }

        if (currencyFormat != undefined) {
            if (!valid.isValidate(currencyFormat)) return res.status(400).send({ status: false, message: "currencySymbol wrong format" });
            if (currencyFormat != '₹') return res.status(400).send({ status: false, message: "only indian currency ₹ accepted " });
        }
        if (availableSizes != undefined) {
            if (isValidSize(availableSizes)) return res.status(400).send({ status: false, message: "availableSizes is invalid" })
        // input array
        let product = await productModel.findOne({_id:productId,isDeleted:false})
        if(!product)
        return res.status(404).send({status:false,message:"Product not found"})

        let sizesList = availableSizes.toUpperCase().split(",").map(x => x.trim());
        //existing array
        let productSizes = product.availableSizes
        //if doesnt exist in existing, add to array
        let addArr = sizesList.filter((elem)=> !productSizes.includes(elem))
        //if in existing but not in input, add to array
        productSizes.map((elem)=>{if(!sizesList.includes(elem))   
                                    addArr.push(elem)})

        data.availableSizes = addArr}

        let updatedProduct = await productModel.findOneAndUpdate({ _id: productId, isDeleted: false }, data ,{ new: true })
        if(!updatedProduct)
        return res.status(404).send({status:false,message:"Product not found"})
        
        return res.status(200).send({ status: true, message: "Success", data: updatedProduct })


    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}


const deleteProduct = async function (req, res) {

    try {
        let productId = req.params.productId

        if (!valid.isValidId(productId)) {
            return res.status(400).send({ status: false, message: "productId is not valid" })
        }

        let checkProduct =await productModel.findOneAndUpdate({ _id: productId, isDeleted: false  }, { isDeleted: true, deletedAt: new Date() })
        
        if (!checkProduct) {
            return res.status(404).send({ status: false, message: "Sorry! Product not found" })
        }
        
        res.status(200).send({ status: true, message: "Product has been deleted successfully" })

    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }

}




module.exports = { getProducts, createProduct, getProducstById, deleteProduct, updateProduct }
