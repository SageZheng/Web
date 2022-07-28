//jshint esversion:6
require('dotenv').config();
const express = require("express");
const app = express();
const bodyParse = require("body-parser");
const mongoose = require("mongoose");
const encrypt=require("mongoose-encryption");
console.log(process.env.API_KEY);
app.use(bodyParse.urlencoded({
    extended: true
}));
app.set("view engine", "ejs");

app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/userDB")

const userSchema=new mongoose.Schema({
    email:String,
    password:String
})
const secret=process.env.SECRET;
userSchema.plugin(encrypt,{secret:secret,excludeFromEncryption: ['email']});

const User=new mongoose.model("User",userSchema);
app.get("/",function(req,res){
 res.render("home");
})

app.get("/register",function(req,res){
    res.render("register");
})
app.post("/register",function(req,res){
    const newUser = new User({
        email:req.body.username,
        password:req.body.password

    })
    newUser.save(function(err){
        if(err){
            console.log(err);
        }else{
           res.render("secrets")
        }
    });
})
app.get("/login",function(req,res){
    res.render("login");
})
app.post("/login",function(req,res){
    const username = req.body.username;
    const password = req.body.password;
    User.findOne({email:username},function(err,foundUser){
        if(err){
            console.log(err)
        }else{
            if(foundUser){
                console.log(foundUser)
                if(foundUser.password===password){
                    res.render("secrets");
                }
                else{
                    res.send("password err")
                }
            }
        }
    })
})

app.listen(process.env.POR || 3000, function () {
    console.log("Server is running");
  });