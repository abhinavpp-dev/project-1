const stripe = require('stripe')(process.env.STRIPE_SECRETKEY);
const Cart = require('../models/cartmodel');
const User = require('../models/user');
const Order = require('../models/order');
const jwt=require('jsonwebtoken')
const Coupon=require('../models/coupnmodel')


// Function to render the checkout page
// const renderCheckout = async (req, res) => {
//   const token = req.cookies.token;
//   if (!token) {
//     return res.redirect('/login');
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const userId = decoded.userId;

//     // Fetch user data from the database
//     const user = await User.findById(userId);

//     // Fetch user's cart product details
//     const cart = await Cart.findOne({ user: userId }).populate('items.product');
//     if (!cart || cart.items.length === 0) {
//       return res.redirect('/cart1');
//     }

//     // Calculate total amount before discount
//     let totalAmount = cart.items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

//     // Fetch valid, unexpired coupons
//     const coupons = await Coupon.find({ expiryDate: { $gte: new Date() } });

//     // Get applied coupon from query (if exists)
//     const appliedCouponCode = req.query.couponCode?.trim();
//     let discountAmount = 0;

//     if (appliedCouponCode) {
//       const coupon = await Coupon.findOne({ 
//         code: appliedCouponCode, 
//         expiryDate: { $gte: new Date() },
//         usageLimit: { $gt: 0 } // Ensure usage limit is not reached
//       });

//       if (coupon) {
//         discountAmount = (coupon.discount / 100) * totalAmount;
//         totalAmount -= discountAmount; // Apply discount
//       } else {
//         // If the coupon is invalid, send a message (but still proceed with the checkout)
//         res.locals.couponMessage = 'Invalid or expired coupon.';
//       }
//     }

//     // Render checkout page with all data
//     res.render('users/checkout', {
//       cart,
//       totalAmount,
//       coupons,
//       appliedCouponCode,
//       discountAmount,
//       user,
//       couponMessage: res.locals.couponMessage || '', // Pass coupon error or success message
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Server error');
//   }
// };

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
    console.error('Error in renderCheckout:', error);
    res.status(500).send('Server error');
  }
};











// Controller for handling checkout process (payment processing)
const checkoutController = async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect('/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Fetch user's cart product details
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

    const couponCode = req.body.couponCode?.trim();
    let coupon = null;

    // Apply coupon if provided
    if (couponCode) {
      coupon = await Coupon.findOne({
        code: couponCode,
        expiryDate: { $gte: new Date() },
        usageLimit: { $gt: 0 } // Ensure coupon has usage left
      });

      if (coupon) {
        // Check if the user has already used the coupon
        if (coupon.usedBy.includes(userId)) {
          return res.status(400).send('You have already used this coupon.');
        }

        // Calculate discount amount and update totalAmount
        discountAmount = (coupon.discount / 100) * totalAmount;
        totalAmount -= discountAmount;

        // Update coupon usage: add userId and decrement usageLimit
        coupon.usedBy.push(userId);
        coupon.usageLimit -= 1;
        await coupon.save();
      } else {
        return res.status(400).send('Invalid or expired coupon code.');
      }
    }

    const paymentMethod = req.body.paymentMethod;

    if (paymentMethod === 'COD') {
      // Handle Cash on Delivery (COD) logic
      const order = new Order({
        user: userId,
        name: req.body.name,
        items: cart.items,
        totalAmount, // Total after applying coupon discount
        address: req.body.address,
        city: req.body.city,
        phone: req.body.phone,
        paymentMethod: 'COD',
        status: 'Order Placed'
      });

      await order.save();
      // Clear the user's cart after placing the order
      await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });

      return res.render('users/cod', { order });
    } else if (paymentMethod === 'Credit Card') {
      // Create a Stripe Checkout session with the final totalAmount applied item-wise
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: cart.items.map(item => ({
          price_data: {
            currency: 'inr',
            product_data: {
              name: item.product.name,
            },
            unit_amount: item.product.price * 100, // Amount in paise
          },
          quantity: item.quantity,
        })),
        mode: 'payment',
        success_url: "http://localhost:4000/complete?session_id={CHECKOUT_SESSION_ID}",
        cancel_url: "http://localhost:4000/cancel",
        billing_address_collection: 'required',
        phone_number_collection: { enabled: true },
        // Apply coupon if provided
        discounts: couponCode ? [{ coupon: couponCode }] : [],
      });

      return res.redirect(303, session.url);
    }
 else {
      return res.status(400).send('Invalid payment method.');
    }
  } catch (error) {
    console.error('Error in checkoutController:', error);
    return res.status(500).send('Internal server error.');
  }
};


module.exports = { renderCheckout, checkoutController };
