const stripe = require('stripe')(process.env.STRIPE_SECRETKEY);
const Cart = require('../models/cartmodel');
const User = require('../models/user');
const Order = require('../models/order');
const jwt=require('jsonwebtoken')
const Coupon=require('../models/coupnmodel')



const renderCheckout = async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect('/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Fetch user data from the database
    const user = await User.findById(userId);

    // Fetch user's cart product details and populate product data
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.redirect('/cart1');
    }

    // Calculate total amount before discount
    let totalAmount = cart.items.reduce((acc, item) => {
      return acc + item.product.price * item.quantity;
    }, 0);

    // Fetch valid, unexpired coupons (and optionally, you could also filter by usageLimit)
    const coupons = await Coupon.find({ 
      expiryDate: { $gte: new Date() },
      usageLimit: { $gt: 0 } // Only show coupons that still have usage left
    });

    // Get applied coupon from query string (if exists)
    const appliedCouponCode = req.query.couponCode?.trim();
    let discountAmount = 0;

    if (appliedCouponCode) {
      const coupon = await Coupon.findOne({ 
        code: appliedCouponCode, 
        expiryDate: { $gte: new Date() },
        usageLimit: { $gt: 0 }
      });

      if (coupon) {
        // Calculate discount and apply to total
        discountAmount = (coupon.discount / 100) * totalAmount;
        totalAmount -= discountAmount;
      } else {
        // If the coupon is invalid, add a message (this message will be shown on the front end)
        res.locals.couponMessage = 'Invalid or expired coupon.';
      }
    }

    // Render checkout page with all data
    res.render('users/checkout', {
      cart,
      totalAmount,
      coupons,
      appliedCouponCode,
      discountAmount,
      user,
      couponMessage: res.locals.couponMessage || ''
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res. redirect('/login')
  }
    console.error('Error in renderCheckout:', error);
    res.status(500).send('Server error');
  }
};






const checkoutController = async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect('/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Fetch user's cart details
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.redirect('/cart1');
    }

    // Calculate total amount before discount
    let totalAmount = cart.items.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    );

    let discountAmount = 0;
    let couponCode = req.body.couponCode?.trim();
    // Check if coupon is valid
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
      if (coupon && coupon.expiryDate > new Date()) {
        discountAmount = (totalAmount * coupon.discount) / 100;
        totalAmount -= discountAmount;
      }
    }

   

    const paymentMethod = req.body.paymentMethod;

    if (paymentMethod === 'COD') {
      // Handle Cash on Delivery (COD) order
      const order = new Order({
        user: userId,
        name: req.body.name,
        email: req.body.email,
        items: cart.items,
        totalAmount: req.body.totalAmount,
        discountAmount: discountAmount || 0,
        couponCode: req.body.couponCode || null,
        address: req.body.address,
        city: req.body.city,
        postalCode: req.body.postalCode,  // Postal code from the form
        phone: req.body.phone,
        paymentMethod: 'COD',
        paymentStatus: 'Unpaid',
        status: 'Order Placed',
      });

      await order.save();
      await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });

      return res.render('users/cod', { order });
    } else if (paymentMethod === 'Credit Card') {
      // Handle Stripe payment
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: cart.items.map(item => {
          const discountedPrice = Math.round(
            item.product.price * (1 - discountAmount / totalAmount) * 100
          ); // Apply the proportional discount to each item

          return {
            price_data: {
              currency: 'inr',
              product_data: {
                name: item.product.name,
              },
              unit_amount: discountedPrice,
            },
            quantity: item.quantity,
          };
        }),
        mode: 'payment',
        success_url: `http://localhost:4000/complete?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `http://localhost:4000/cancel`,
        billing_address_collection: 'required',
        phone_number_collection: { enabled: true },
        metadata: {
          userId: userId,
          couponCode: couponCode || 'N/A',
          discountAmount: discountAmount.toFixed(2),
        }
      });

      return res.redirect(303, session.url);
    } else {
      return res.status(400).send('Invalid payment method.');
    }
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res. redirect('/login')
  }
    console.error('Error in checkoutController:', error);
    return res.status(500).send('Internal server error.');
  }
};





module.exports = { renderCheckout, checkoutController };
