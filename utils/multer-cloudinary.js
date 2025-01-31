const multer=require('multer');
const {CloudinaryStorage}=require('multer-storage-cloudinary')

const cloudinary=require('./cloudinary');//import cloudinary setup
const { param } = require('../routes/adminroutes');

//configure multerv to use cloudinary

const storage=new CloudinaryStorage({
  cloudinary:cloudinary,
  params:{
    folder:'menu',
    allowed_formats:['jpg','jpeg','png','webp'],
  }
});
const upload=multer({storage});

module.exports=upload;


