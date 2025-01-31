const { error } = require('toastr');
const Banner=require('../models/bannermodel');
cloudinary=require('../utils/cloudinary')

const { parse } = require('dotenv');


//render the slidebarform

const renderslider=async(req,res)=>{
  try{
    res.render('admin/banner');
  }catch(err){
    console.log(error);
    res.status(400).send('internal server error');
  }
};

const addslider=async(req,res)=>{
  try{
    const {title,subtitle}=req.body;
    const imageUrl=req.file.path;
    const newSlider=new Banner({
      title,
      subtitle,images:[{imageUrl}]//saving the clodinary image url

    });
    await newSlider.save();
    res.render('admin/banner');
  }catch(error){
    console.error(error);
    res.status(400).send('interanalserver error')
  }
}


//manageslider

const rendermanageslider=async(req,res)=>{
  try{
    const sliders=await Banner.find();//fetch all sliders from the database
  res.render('admin/managebanner',{sliders});
  
  
  }catch(error){
    console.error(error)
      res.status(400).send(' internal server error')
    
  }

}

const updateslider = async (req, res) => {
  try {
    const { id } = req.params; // Get the slider ID from the URL parameters
    const { title, subtitle } = req.body;

    await Banner.findByIdAndUpdate(id, { title, subtitle }, { new: true }); // Update slider using the ID

    res.render('admin/managebanner'); // Redirect to slider management
  } catch (error) {
    console.error('Error updating slider:', error);
    res.status(500).send('Server Error');
  }
};

//delete slider
const deleteslider=async(req,res)=>{
  try{
    const {id}=req.params;

    await Banner.findOneAndDelete(id);
    console.log('slider deleted');
    res.redirect('/banners');
  }catch(error){
    console.log(error);
    res.status(404).send('internal server error');
  }
}

module.exports={renderslider,addslider,rendermanageslider,updateslider,deleteslider};

