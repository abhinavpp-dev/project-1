const jwt = require('jsonwebtoken');
const Coupon = require('../models/coupnmodel');
// require('dotenv').config();

const Order = require('../models/order');
const Cart = require('../models/cartmodel');
// const User=require('../models/user');
// const Coupon=require('../models/coupnmodel');
const stripe=require('stripe')(process.env.STRIPE_SECRETKEY)

const renderCheckout = async (req, res) => {
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
    let totalAmount = cart.items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

    // Fetch only valid, unexpired coupons
    const coupons = await Coupon.find({ expiryDate: { $gte: new Date() } });

    // Get applied coupon from query (if exists)
    const appliedCouponCode = req.query.couponCode?.trim();
    let discountAmount = 0;

    if (appliedCouponCode) {
      const coupon = await Coupon.findOne({ code: appliedCouponCode, expiryDate: { $gte: new Date() } });

      if (coupon) {
        discountAmount = (coupon.discountPercentage / 100) * totalAmount;
        totalAmount -= discountAmount; // Apply discount
      }
    }

    // Render checkout page with all data
    res.render('users/checkout', {
      cart,
      totalAmount,
      coupons,
      appliedCouponCode,  // Pass applied coupon for UI display
      discountAmount      // Show discount amount in UI
    });

  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};


// const checkoutController = async (req, res) => {
//   const token = req.cookies.token;
//   if (!token) {
//     return res.redirect('/login');
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const userId = decoded.userId;

//     // Fetch user's cart product details
//     const cart = await Cart.findOne({ user: userId }).populate('items.product');
//     if (!cart || cart.items.length === 0) {
//       return res.redirect('/cart1');
//     }

//     // Calculate total amount (before discount)
//     let totalAmount = cart.items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

//     // Get coupon code from request body
//     const couponCode = req.body.couponCode?.trim(); // Trim to avoid extra spaces
//     console.log("Coupon Code:", couponCode);

//     const paymentMethod = req.body.paymentMethod;

//     if (paymentMethod === 'COD') {
//       // Handle Cash on Delivery (COD) logic
//       const order = new Order({
//         user: userId,
//         name: req.body.name,
//         items: cart.items,
//         totalAmount, // No discount applied manually, Stripe handles it
//         address: req.body.address,
//         city: req.body.city,
//         phone: req.body.phone,
//         paymentMethod: 'COD',
//         status: 'Order Placed',
//       });

//       await order.save();
//       await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });

//       return res.render('users/cod', { order });
//     } else if (paymentMethod === 'Credit Card') {
//       // Create a Stripe Checkout session
//       const session = await stripe.checkout.sessions.create({
//         payment_method_types: ['card'],
//         line_items: cart.items.map(item => ({
//           price_data: {
//             currency: 'inr',
//             product_data: {
//               name: item.product.name,
//             },
//             unit_amount: item.product.price * 100, // Amount in paise
//           },
//           quantity: item.quantity,
//         })),
//         mode: 'payment',
//         success_url: "http://localhost:4000/complete?session_id={CHECKOUT_SESSION_ID}",
//         cancel_url: "http://localhost:4000/cancel",
//         billing_address_collection: 'required',
//         phone_number_collection: { enabled: true },
//         // Apply coupon if provided
//         discounts: couponCode ? [{ coupon: couponCode }] : [],
//       });

//       return res.redirect(303, session.url);
//     }

//     return res.status(400).send('Invalid payment method.');
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Server error');
//   }
// };
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
    let totalAmount = cart.items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

    // Get coupon code from request body
    const couponCode = req.body.couponCode?.trim(); // Trim to avoid extra spaces
    console.log("Coupon Code:", couponCode);

    let discountAmount = 0;
    if (couponCode) {
      // Check if coupon is valid
      const coupon = await Coupon.findOne({ code: couponCode, expiryDate: { $gte: new Date() } });
      
      if (coupon) {
        discountAmount = (coupon.discountPercentage / 100) * totalAmount;
        totalAmount -= discountAmount; // Apply discount
      } else {
        return res.status(400).send('Invalid coupon code.');
      }
    }

    const paymentMethod = req.body.paymentMethod;

    if (paymentMethod === 'COD') {
      // Handle Cash on Delivery (COD) logic
      const order = new Order({
        user: userId,
        name: req.body.name,
        items: cart.items,
        totalAmount, // Total after applying coupon
        address: req.body.address,
        city: req.body.city,
        phone: req.body.phone,
        paymentMethod: 'COD',
        status: 'Order Placed',
      });

      await order.save();
      await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });

      return res.render('users/cod', { order });
    } else if (paymentMethod === 'Credit Card') {
      // Create a Stripe Checkout session with the final totalAmount
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

    return res.status(400).send('Invalid payment method.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};




module.exports = { renderCheckout, checkoutController };
