const Product=require('../models/product');
const Category=require('../models/category');
const { parse } = require('dotenv');
const { success, error } = require('toastr');

//render add product form

const renderaddproductform = async (req, res) => {
  try {
    // Fetch all categories from the database
    const categories = await Category.find();
    
    // Render the addproduct view with categories and no messages
    res.render('admin/addproduct', { categories, success: null, error: null });
  } catch (err) {
    console.error('Error rendering add product form:', err);
    res.render('users/404'); // Render a 404 page in case of an error
  }
};

const addproduct = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    const imageUrl = req.file.path; // Get the uploaded image path

    // Create a new product
    const product = new Product({
      name,
      description,
      price,
      category,
      image: imageUrl, // Save the image URL
    });

    // Save the product to the database
    await product.save();

    // Fetch all categories again to re-render the form
    const categories = await Category.find();

    // Render the addproduct view with a success message and categories
    res.render('admin/addproduct', { categories, success: 'Product added successfully!', error: null });
  } catch (err) {
    console.error('Error adding product:', err);

    // Fetch all categories again to re-render the form
    const categories = await Category.find();

    // Render the addproduct view with an error message and categories
    res.render('admin/addproduct', { categories, success: null, error: 'Failed to add product. Please try again.' });
  }
};


const getproduct=async (req,res)=>{
  try{
    const page=parseInt(req.query.page)||1//current page
    const limit=10;//number of products per page
    const skip=(page-1)*limit//number of products to skip

    const products=await Product.find()
    .populate('category')
    .skip(skip)
    .limit(limit);
    
    const totalProducts=await Product.countDocuments();
    const totalpages=Math.ceil(totalProducts/limit);

    const categories=await Category.find();
    res.render('users/shop',{products,categories,currentpage:page,totalpages,success:null,error:null})

   
  }catch(err){
    console.error('error fetching products',err)
    //  res.status(400).send('server error')
    res.render('users/404')
  }
};

//view menu

const viewmenu=async(req,res)=>{

  try{
    const menuitems= await Product.find().populate('category');

    res.render('admin/viewmenu',{menuitems,success:null,error:null});

    }catch(error)
    {
      console.error('error in fetching aLL PRODUCT DETAILS',error)
      res.render('users/404')
    }

  }

// updatemenu
const renderupdatemenu = async (req, res) => {
  try {
    // Fetch the product based on its ID
    const product = await Product.findById(req.params.id);

    // Fetch all categories for the dropdown
    const categories = await Category.find();

    if (!product) {
      return res.status(404).send('Product not found');
    }

    // Pass both product and categories to the view
    res.render('admin/updatemenu', { product, categories });
  } catch (error) {
    console.error(error);
    res.render('users/404');
  }
};

const updatemenu = async (req, res) => {
  try {
    const { name, description, price, category, image } = req.body;

    // Validate if product ID is valid
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).send('Invalid product ID');
    }

    // Find and update the product by ID
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id, 
      { name, description, price, category, image },
      { new: true, runValidators: true } // Return the updated product and run validation
    );

    if (!updatedProduct) {
      return res.status(404).send('Menu item not found');
    }

    res.redirect('/viewmenu'); // Redirect after successful update
  } catch (error) {
    console.error(error);
    res.render('users/404'); // Render error page if something goes wrong
  }
};


const deletemenuitem=async(req,res)=>{
  try{
    const menuitem=await Product.findByIdAndDelete(req.params.id);
    if(!menuitem){
      return res.status(404).send('menu item not found');

    }
    res.redirect('/viewmenu')
  }catch(error){
    console.error(error);
    // res.status(404).send('internal server error');
    res.render('users/404')
  }
}


  

module.exports={renderaddproductform,addproduct,getproduct,viewmenu,renderupdatemenu,updatemenu,deletemenuitem}