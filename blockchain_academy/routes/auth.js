var express = require('express');
var router = express.Router();
var user = require('../db/user');





module.exports = function(passport){
    router.post('/signup',function(req ,res){
        var body = req.body,
        email=body.email,
        password=body.password;
        user.findone({email:email},function(err,doc){
            if(err){res.status(500).send('error occured')}
                else{
                    if(doc){
                        res.status(500).send('Email Id already exists')
                    }
                    else{
                        var record = new User()
                        record.email = email;
                        record.password = record.hashPassword(password);
                        record.save(function(err,user){
                         if(err){
                             res.status(500).send('db error')
                         }else{
                             res.send(user)
                         }
                        })
                    }


                    
                }
        })

 });
    return router;
};
