const User = require("../models/user");

exports.getAllCertificates = async (req,res) => {
    if (!req.user){
        // pls login
        res.redirect('/login');
    }
    const user = await User.findOne({email:req.user.email}).catch(err => {
        console.log("Error while fetching the user from mongodb: ",err);
        res.json({certificateHash:null,status:500,msg:"looks like our database is under maintenance, please try again after some time"})
    })
    if (user.examData.certificateHash.length<1){
        res.json({certificateHash:null,status:412,msg:"no certificates associated with this account"})
    }
    res.json({certificateHash:user.examData.certificateHash,status:200,msg:"ok"})
}