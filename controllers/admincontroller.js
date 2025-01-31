
const User=require('../models/user');
const  Admin=require('../models/admin');
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken');
const Order=require('../models/order')




const viewusers=async(req,res)=>{
  try{

  
  const users=await User.find();//fetch all users
  res.render('admin/viewuser',{users});

}catch(err){
  console.error('error in fetching users:',err);
  res.status(500).send('server error');
}
};
//render  admin login page
const renderadminlogin=(req,res)=>{
  res.render('admin/adminlogin',{success:null,error:null});
}


//login
const adminlogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
  

    const { labels, data } = await salesreport(); // Get sales data

    res.render('admin/admindash', { 
        success: 'welcome admin', 
        error: null, 
        labels: labels, 
        data: data 
    }); 

  } catch (error) {
console.log(error);
res.status(404).send('server error');
  }
};


//adminlogout
const adminlogout=(req,res)=>{
  res.clearCookie('token');
  res.redirect('/adminlogin');
}



const blockuser=async(req,res)=>{
  try{
    const userId=req.params.id;
    const user=await User.findByIdAndUpdate(userId,{isBlocked:true},{new:true});
    if(user){
      res.redirect('/users')
    }else{
      res.status(404).send('user not found');
    }
  }catch(error){
    console.error(error);
    res.status(400).send('internal server error');

  }
};
const unblockuser=async(req,res)=>{
  try{
    const userId=req.params.id;
    const user=await User.findByIdAndUpdate(userId,{isBlocked:false},{new:true});

    if(user){
      res.redirect('/users');
    }else{
      res.status(404).send('user not found');
    }
  }catch(err){
    console.error(err);
    res.status(500).send('internal server error');
  }
}


const salesreport = async () => {
  try {
    const pipeline = [
      {
        $group: {
          _id: { $month: "$createdAt" }, 
          totalSales: { $sum: "$totalAmount" }
        }
      },
      {
        $sort: { _id: 1 } 
      }
    ];

    const results = await Order.aggregate(pipeline);

    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const monthlySales = Array(12).fill(0); 

    results.forEach(result => {
      monthlySales[result._id - 1] = result.totalSales; 
    });

    return {
      labels: months,
      data: monthlySales
    };
 
  } catch (error) {
    console.error('Error fetching monthly sales data:', error);
    return { labels: [], data: [] };
  }
};


const rendersalesreport=async(req,res)=>{
  try{
    const { labels, data } = await salesreport(); 

    
    res.render('admin/admindash', { 
      success: 'welcome admin', 
      error: null, 
      labels: labels, 
      data: data 
  }); 
  }catch(error){
    console.log(error);
    res.status(404).send('internal server error')
  }
}





module.exports={viewusers,renderadminlogin,adminlogin,adminlogout,blockuser,unblockuser,salesreport,rendersalesreport};