const jwt=require("jsonwebtoken");
const User=require('../models/user');
const user = require("../models/user");
const { error } = require("toastr");

exports.renderprofile=async (req,res)=>{
  try{
    const token=req.cookies.token;
  const decoded=jwt.verify(token,process.env.JWT_SECRET);
const user=await User.findById(decoded.userId);

if(!user){
  return res.render('/');
}
res.render('users/profile',{user});
  }catch(error){
    console.error(error);
    res.status(500).send('server error');
  }
};

exports.updateProfile=async(req,res)=>{
  try{
    const {fullName,email,mobile}=req.body;
    const token=req.cookies.token;
    const decoded=jwt.verify(token,process.env.JWT_SECRET);
    const userId=decoded.userId;
    const updateduser=await user.findByIdAndUpdate(
      userId,
      {fullName,email,mobile},
      {new:true}
    );
    if(!updateduser){
      res.render("users/404");
    }
    res.render("users/profile",{user:updateduser,message:"profile updated sucessfully"})
  }catch(error){
  console.error(error);
  res.status(500).send('server error');
  }
}


exports.addAdress=async (req,res)=>{
  try{
    const {label, street, city, state, zipCode, country}=req.body;

    const token=req.cookies.token;
    const decoded=jwt.verify(token,process.env.JWT_SECRET);
    const user=await User.findById(decoded.userId);

    if(!user){
      return res.render('/')
    }
    user.addresses.push({label, street, city, state, zipCode, country});
    await user.save();
    res.redirect('/profile')
  }catch(error){
    console.error(error);
    res.status(500).send('server error');
  }
};

// Delete Address
exports.deleteAdress=async (req,res)=>{
  const {addressId}=req.body
  try{
    const updateUser=await User.findByIdAndUpdate(req.user._id,
      {$pull:{addresses:{_id:addressId}}},
      {new:true}

    );
    res.redirect("/profile");

  }catch(error){
    console.error(error)

  }
}