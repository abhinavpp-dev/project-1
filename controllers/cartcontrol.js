const jwt = require('jsonwebtoken');
const Cart = require('../models/cartmodel');
const Product = require('../models/product');



const addcart = async (req, res) => {
    // Retrieve the token from cookies
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Please log in first.' });
        // res.render('users/404');
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId; // Extract userId from the token payload

        // Get productId from the request body
        const { productId } = req.body;

        if (!productId) {
            // return res.status(400).json({ message: 'Product ID is required.' });
            res.render('users/404');
        }

        // Check if the product exists
        const product = await Product.findById(productId);
        if (!product) {
            // return res.status(404).json({ message: 'Product not found.' });
            res.render('users/404');
        }

        // Check if the cart exists for the user
        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        // Check if the product is already in the cart
        const cartItem = cart.items.find(item => item.product.equals(productId));
        if (cartItem) {
            cartItem.quantity += 1; // Increment quantity if it exists
        } else {
            cart.items.push({ product: productId, quantity: 1 }); // Add new product to the cart
        }

        cart.updatedAt = new Date(); // Update the timestamp
        await cart.save(); // Save the cart

        // Send success response
        return res.status(200).json({ message: 'Product added to cart successfully.' });
    } catch (err) {
        console.error('Error in addcart:', err);

        // Handle JWT-specific errors
        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Invalid or expired token. Please log in again.' });
        }

        // Handle other errors
        // return res.status(500).json({ message: 'Internal server error.' });
        res.render('users/404');
    }
};

  
const rendercart = async (req, res) => {
    // Retrieve the token from cookies
    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/login')
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId; // Extract userId from the token payload

        // Fetch the user's cart and populate the product details
        const cart = await Cart.findOne({ user: userId }).populate('items.product');
  
        // Calculate the total amount
        let totalAmount = 0;
        let cartItems = [];
        if (cart && cart.items.length > 0) {
            cartItems = cart.items;
            totalAmount = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
        }

        // Render the cart page with cart details and total amount
        return res.render('users/cart1', { cart: { items: cartItems }, totalAmount });
    } catch (err) {
        // Handle JWT-specific errors
        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
            return res. redirect('/login')
        }
        // Handle server errors
        return res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

const increaseitem=async(req,res)=>{
    const token=req.cookies.token;
    if(!token){
        return res.redirect('/login');
    }
    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        const userId=decoded.userId;
        const {productId}=req.body;

        //fetch the cart

        const cart=await Cart.findOne({user:userId});
        
       

        const cartItem=cart.items.find(item=>item.product.equals(productId));
       if(cartItem ){

        cartItem.quantity+=1;//increase the quantity

        cart.updatedAt=new Date();
        await cart.save();

        //recalculate the total amount
        let totalAmount=0;
        cart.items.forEach(item=>{
            totalAmount+=item.product.price*item.quantity;
        });
        return res.redirect('/cart1');
        

     }
   

    }catch(error){
        console.error(error);
        // res.status(404).send('internal server error');
        res.render('users/404');
    }
}

const decreaseitem=async(req,res)=>{
    const token=req.cookies.token;
    if(!token){
        res.redirect('/login');
    }
try{
    const decoded=jwt.verify(token,process.env.JWT_SECRET);
    const userId=decoded.userId;
    const {productId}=req.body;

    const cart=await Cart.findOne({user:userId});

    const cartitem=cart.items.find(item=>item.product.equals(productId));
    if(cartitem){
        cartitem.quantity-=1//decrease quantity
        cart.updatedAt=new Date();
        await cart.save();
    }
    
    res.redirect('/cart1');


}catch(error){
    console.error(error)
    // res.status(404).send('internal server error');
    res.render('users/404');
}

}


const removeitem = async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/login');
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // Get the productId from the request body
        const { productId } = req.body;

        // Find the user's cart
        const cart = await Cart.findOne({ user: userId });

        if (cart) {
            // Find the item index
            const itemIndex = cart.items.findIndex(item => item.product.equals(productId));
            if (itemIndex > -1) {
                // Remove the item from the cart
                cart.items.splice(itemIndex, 1);
                cart.updatedAt = new Date();

                // Save the updated cart
                await cart.save();

                // Redirect or send success response
                return res.redirect('/cart1');
            } else {
                // Product not found in cart
                return res.status(404).send('Product not found in cart.');
            }
        } else {
            // Cart not found
            return res.status(404).send('Cart not found.');
        }
    } catch (err) {
        console.error(err);
        // return res.status(500).send('Internal server error.');
        res.render('users/404');
    }
};



 

module.exports={addcart,rendercart,increaseitem,decreaseitem,removeitem}