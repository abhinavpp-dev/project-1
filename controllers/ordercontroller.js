const Order = require('../models/order');
const jwt=require('jsonwebtoken');

const renderAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page number from query params, default to 1
    const limit = 10; // Number of orders to display per page
    const skip = (page - 1) * limit; // Calculate how many records to skip

    // Fetch orders with pagination
    const orders = await Order.find({})
      .populate('user') // Populate user details
      .populate('items.product') // Populate product details
      .sort({ createdAt: -1 }) // Sort by newest orders first
      .skip(skip) // Skip records based on the page number
      .limit(limit); // Limit the number of orders per page

    // Total number of orders in the database
    const totalOrders = await Order.countDocuments();

    // Calculate pagination details
    const totalPages = Math.ceil(totalOrders / limit);
    const hasPreviousPage = page > 1;
    const hasNextPage = page < totalPages;
    const previousPage = hasPreviousPage ? page - 1 : null;
    const nextPage = hasNextPage ? page + 1 : null;

    // Render the admin order details view with pagination data
    res.render('admin/orderdetails', {
      orders,
      currentPage: page,
      totalPages,
      hasPreviousPage,
      hasNextPage,
      previousPage,
      nextPage,
      message: orders.length > 0 ? null : 'No orders found.',
    });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).send('Error fetching orders.');
  }
}

const  deleteorder=async(req,res)=>{
  const orderId=req.params.id;
  try{
    const delteorder=await Order.findByIdAndDelete(orderId);
    if(!delteorder){
      return res.status(404).send('order not found');
    }
    res.redirect('/orders')
  }catch(error){
    console.error(error);
    res.status(400).send('interal error')
  }
};

updateorder=async(req,res)=>{
  const {id}=req.params;
  const{status}=req.body;
  try{
    const updatedorder=await Order.findByIdAndUpdate(
      id,
      {status},
      {new:true}
    );
    if(!updatedorder){
      return res.status(404).json({message:'error in update'});
    }
    res.redirect('/orders')
  }catch(error){
    console.error(error);
    res.status(404).send('internal  server error');
  }

}
updateorder = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    // Retrieve the order from the database to check payment method
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // If payment method is COD and the status is Delivered, update paymentStatus to Paid
    if (order.paymentMethod === 'COD' && status === 'Delivered') {
      order.paymentStatus = 'Paid';
    }

    // Update the order with the new status
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status: status, paymentStatus: order.paymentStatus }, // Ensure paymentStatus is updated
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Error in updating the order' });
    }

    res.redirect('/orders'); // Redirect to orders page after update
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
};



const userorder = async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    console.error("No token found, redirecting to login.");
    return res.redirect('/login');
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId; // Extract userId from the token payload

console.log(userId);
    

    const orders = await Order.find({ user: userId })
      .populate('items.product')
      .sort({ createdAt: -1 });
    
    console.log("Fetched Orders:", orders);  // Check fetched orders

    if (!orders || orders.length === 0) {
      console.log("No orders found for this user.");
    }

    res.render('users/userorder', { orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).send('Server Error');
  }
};

const deliveredOrders = async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    console.error("No token found, redirecting to login.");
    return res.redirect('/login');
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId; // Extract userId from the token payload

console.log(userId);
    

    const orders = await Order.find({ user: userId })
      .populate('items.product')
      .sort({ createdAt: -1 });
    
    console.log("Fetched Orders:", orders);  // Check fetched orders

    if (!orders || orders.length === 0) {
      console.log("No orders found for this user.");
    }

    res.render('users/deliveredorder', { orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).send('Server Error');
  }
};



module.exports = { renderAllOrders,deleteorder,updateorder,userorder,deliveredOrders };
