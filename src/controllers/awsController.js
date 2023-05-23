const aws = require('aws-sdk')

aws.config.update({

    accessKeyId:"AKIAY3L35MCRZNIRGT6N",
     secretAccessKey:"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",
    region:"ap-south-1"
})

const uploadFile = async function(file){

    try{return new Promise(function(resolve,reject){

        let s3 = new aws.S3({apiVersion:'2006-03-01'})
        const upParams ={
            ACL: "public-read",
        Bucket: "classroom-training-bucket",  //HERE
        Key: "abc/" + file.originalname, //HERE 
        Body: file.buffer
        }
        
        s3.upload(upParams, function(err,data){

            if(err)
                return reject({err})
            return resolve(data.Location)
        })

    })}

    catch(err)
    {return res.status(500).send({err:err.message})}
}

module.exports.uploadFile = uploadFile