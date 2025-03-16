const jwt=require("jsonwebtoken");
const User=require('../models/user');
const user = require("../models/user");
const { error } = require("toastr");
const mongoose=require('mongoose')

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
    const {
      label,
      fullName,
      mobile,
      street,
      landmark,
      city,
      state,
      zipCode,
      country,
      instructions,
      isDefault
  } = req.body;

  

    const token=req.cookies.token;
    const decoded=jwt.verify(token,process.env.JWT_SECRET);
    const user=await User.findById(decoded.userId);

    if(!user){
      return res.redirect('/')
    }

    if(isDefault){
      user.addresses.forEach(address=>{
        address.isDefault=false;
      })
    }
    // / Add new address
        user.addresses.push({
            label,
            fullName,
            mobile,
            street,
            landmark,
            city,
            state,
            zipCode,
            country,
            deliveryInstructions: instructions,
            isDefault: isDefault || false
        });
    await user.save();
    res.redirect('/profile')
  }catch(error){
    console.error(error);
    res.status(500).send('server error');
  }
};

// Delete Address
exports.deleteAddress = async (req, res) => {
  const { userId } = req.params;
  const { addressId } = req.body;

  console.log("Received User ID:", userId);
  console.log("Received Address ID:", addressId);

  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(addressId)) {
      return res.status(400).json({ error: "Invalid ID format" });
  }

  try {
      const updateUser = await User.findById(userId);

      if (!updateUser) {
          return res.status(404).json({ error: "User not found" });
      }

      console.log("User found:", updateUser);

      const initialAddressCount = updateUser.addresses.length;

      await User.findByIdAndUpdate(
          userId,
          { $pull: { addresses: { _id: new mongoose.Types.ObjectId(addressId) } } }, // FIX: Ensure correct ObjectId conversion
          { new: true }
      );

      const updatedUser = await User.findById(userId);
      const finalAddressCount = updatedUser.addresses.length;

      console.log("Initial Address Count:", initialAddressCount);
      console.log("Final Address Count:", finalAddressCount);

      if (initialAddressCount === finalAddressCount) {
          return res.status(404).json({ error: "Address not found or already deleted" });
      }

      res.redirect("/profile");
  } catch (error) {
      console.error("Error in deleting address:", error);
      res.status(500).json({ error: "Server error" });
  }
};
