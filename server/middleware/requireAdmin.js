require("dotenv").config();

module.exports = (req,res,next) => {
    if (req.user.email === process.env.ADMIN_ID){
        next()
    }else{
        res.render("error");
    }
}