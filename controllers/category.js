const Category = require("../models/category");

const rendercategories=async (req,res)=>{
  try{
    const categories=await Category.find();
    res.render('admin/category',{categories});
  }catch(error){
    console.log('error in rendering category',error);
    res.status(400).send('server error');
  }
};
const createcategory=async (req,res)=>{
  try{
    const {name}=req.body;
    const category=new Category({name});
    await category.save();
    res.redirect('/categories');
    
  }catch(error)
  {
    console.error('error in creting new category',error);  
res.status(400).send('intrenal server erorr');
  }
};

const deletecategory= async (req,res)=>{
  try{
    const {id}=req.params;
    await Category.findByIdAndDelete(id);
    res.redirect('/categories');
  }catch(error){
    console.log("error in deleting category",error);
    res.status(400).send('internal sreber error');
  }
}

module.exports={rendercategories,createcategory,deletecategory}