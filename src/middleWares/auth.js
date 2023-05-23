const jwt = require('jsonwebtoken');
const validation = require("../validators/userValidator")
const userModel = require("../models/userModel")


const Authentication = async function (req, res, next) {
    try {
        // accessing token from headers
        let token = req.headers.authorization
        if (!token) return res.status(400).send({ status: false, message: 'TOKEN is missing !!!' });

        token=token.split(" ")[1]

       jwt.verify( token, "project/productManagementGroup13",(error, response) => {
        if (error) {
          return res
            .status(401)
            .send({ status: false, message: "Not a Valid Token or Token Expired" });
        }
        req.userId = response.userId

        next()
        })
        
        
            
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


const Authorization = async function (req, res, next){
    try {
        let userId = req.params.userId

        if (!validation.isValidId(userId)) return res.status(400).send({ status: false, message: "User id not valid" });

        // authorizing the user
        if (userId != req.userId) return res.status(403).send({ status: false, message: "user not authorized" })
        
        let user = await userModel.findOne({ _id: req.userId });
        if (!user) {
            return res.status(404).send({ status: false, message: "User Not found" });
        }
        next()
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


module.exports = { Authentication, Authorization };