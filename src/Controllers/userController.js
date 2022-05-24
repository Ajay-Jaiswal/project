const userModel = require("../models/userModel")
const aws = require("aws-sdk")
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken")

const isValid = function(value){
    if(typeof value === 'undefined' || value === null) return false
    if(typeof value === 'string' && value.trim().length === 0) return false
    // if(typeof value === 'number' && value.toString().trim().length === 0) return false
    return true
}

const isValidRequestBody = function(requestBody){
    return Object.keys(requestBody).length > 0
}

const emailRegex = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/

const mobileRegex = /^[6-9]\d{9}$/                // /^[0-9]{10}$/  <--Only verify numbers

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/


aws.config.update({
    accessKeyId: "AKIAY3L35MCRUJ6WPO6J",
    secretAccessKey: "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",
    region: "ap-south-1"
})

let uploadFile = async (file) => {

    return new Promise(function (resolve, reject) {
        // this function will upload file to aws and return the link
        let s3 = new aws.S3({ apiVersion: "2006-03-01" }); // we will be using the s3 service of aws

        var uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket", //HERE
            Key: "abc/" + file.originalname, //HERE
            Body: file.buffer,
        };

        s3.upload(uploadParams, function (err, data) {
        if (err) {
            return reject({ error: err });
        }
        console.log(data);
        console.log("file uploaded succesfully");
        return resolve(data.Location);
        });

        // let data= await s3.upload( uploadParams)
        // if( data) return data.Location
        // else return "there is an error"
    });
};


const register = async function(req,res){

    let requestBody =  req.body
    
    //Validation Start
    if(!isValidRequestBody(requestBody)){
        return res.status(400).send({status:true, message:"Please enter details"})
    }

    //Extract Params
    const {fname, lname, email,  password, phone} = requestBody

    if(!isValid(fname)){
        return res.status(400).send({status:false, message:'First Name is required'})
    }

    if(!isValid(lname)){
        return res.status(400).send({status:false, message:'Last Name is required'})
    }

    if(!isValid(email)){
        return res.status(400).send({status:false, message:'Email is required'})
    }
    //check for valid mail
    if(!email.match(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/)){
        return res.status(400).send({status:false, message:'Invalid Mail'})
    }
    //check for unique mail
    const isEmailAlreadyUsed = await userModel.findOne({email})
    if(isEmailAlreadyUsed){
        return res.status(400).send({status:false, message:'This email is already registered'})
    }

    // if(!isValid(profileImage)){
    //     return res.status(400).send({status:false, message:'Profile Image is required'})
    // }

    if(!isValid(password)){
        return res.status(400).send({status:false, message:'Password is required'})
    }
    //check for password length
    if(!(password.length>=8 && password.length<=15)){
        return res.status(400).send({status:false, message:'Password should have length in range 8 to 15'})
    }

    if(!isValid(phone)){
        return res.status(400).send({status:false, message:'Phone no is required'})
    }
    //check for unique no
    const isNoAlreadyUsed = await userModel.findOne({phone})
    if(isNoAlreadyUsed){
        return res.status(400).send({status:false, message:'This no is Already registered'})
    }
    //check for valid no
    if(!(/^[6-9]\d{9}$/.test(phone))){
        return res.status(400).send({status:false, message:'Invalid no'})
    }

    let shipping = requestBody.address.shipping  

    if(!isValid(shipping.street)){
        return res.status(400).send({status:false, message:'Street is required'})
    }

    if(!isValid(shipping.city)){
        return res.status(400).send({status:false, message:'City is required'})
    }

    if(!isValid(shipping.pincode)){
        return res.status(400).send({status:false, message:'Pincode is required'})
    }

    let billing = requestBody.address.billing

    if(!isValid(billing.street)){
        return res.status(400).send({status:false, message:'Street is required'})
    }

    if(!isValid(billing.city)){
        return res.status(400).send({status:false, message:'City is required'})
    }

    if(!isValid(billing.pincode)){
        return res.status(400).send({status:false, message:'Pincode is required'})
    }
    //Validation End

    //File-cloud Data for storing image
    let files = req.files

    if (!(files && files.length > 0))
    return res.status(400).send({ status: false, message: "No file found" });
    
    let uploadedFileURL = await uploadFile(files[0]);
    
    const finalImageData = JSON.parse(JSON.stringify(requestBody));

    finalImageData.profileImage = uploadedFileURL;

    const registerUser = await userModel.create(finalImageData)
    res.status(201).send({status:true, message:'Success', data:registerUser})

}

const loginUser = async function (req, res) {
    try{
    
    let loginData =req.body
    let {email,password}=loginData //extract params


    if(!isValidRequestBody(loginData)){
    return res.status(400).send({status:false, msg : "Invalid request parameters.Please provide login details"})
    }

    if(!isValid(email)){
    return res.status(400).send({status:false, msg:"E-mail is required"})
    }

    if(!(emailRegex.test(email))){
    return res.status(400).send({status:false, msg:"E-mail should be a valid e-mail address"})
    }

    if(!isValid(password)){
    return res.status(400).send({status:false, msg:"password must be present"})
    }
    let user = await userModel.findOne({ email: email, password: password });

    if (!user){
      return res.status(401).send({status: false,msg: "Invalid login credenctial",});
    }

    
    

let token = jwt.sign(
    {
      userId: user._id.toString(),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000)+10*60*60
    },
    'Group41-book/management'
  )
   res.setHeader("x-api-key", token);
  return res.status(200).send({ status: true, msg: "User successfully logged in" ,data: token });
}
catch (err){
    return res.status(500).send({ msg: "Error", error: err.message })
}
};


/*
const userUpdate = async function(req,res){
  let userId = req.params.userId
  let profile = req.body.
  let requestBody = req.body

  //-----------------------------   validations start from here   ----------------------------------//

  if (!isValidRequestBody(requestBody)) 
  return res.status(400).send({ status: false, message: "Invalid request parameters.Please provide the fields that you want to update" })

  if (!isValidRequestBody(userId)) 
  return res.status(400).send({ status: false, message: "No input by user." })

  if (!isValidObjectId(userId)) 
  return res.status(400).send({ status: false, message: "Invalid Book Id." })


  const getUser = await userModel.findOne({ _id: userId})

  if (!getUser) 
  return res.status(404).send({ status: false, message: "No document found or it maybe deleted" })


  const updateUser = await userModel.findOneAndUpdate({ _id: bookId }, { fname:requestBody.fname, lname: requestBody.lname, email:requestBody.email, phone: requestBody.phone,password: requestBody.password,address: requestBody.address }, { new: true })

  return res.status(200).send({ status: true, message: "successfully updated", data: updateUser })

}
*/


module.exports = {register,loginUser}
