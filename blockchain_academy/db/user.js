var mongosse = require('mongosse')
var bcrypt = require('bcrypt-node.js');
var schema = mongosse.schema;

var userSchema = new schema({
     email:{
         type:string,
         required:true,
     },
     password:{
        type:string,
        required:true,
    },
})

userSchema.method.hashpassword = function(password){
               return bcrypt.hashSync(password,bcrypt.gensaltsync(10))
}

userSchema.method.hashpassword = function(password,hash){
    return bcrypt.compareSync(password,hash )
}
module.exports = mongosse.model('users',userSchema,'users');
