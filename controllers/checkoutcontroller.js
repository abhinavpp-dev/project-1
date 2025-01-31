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

    // Calculate total amount
    const totalAmount = cart.items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

    // Fetch available coupons
    const coupons = await Coupon.find({ expiryDate: { $gte: new Date() } }); // Only fetch valid coupons

    // Render checkout page
    res.render('users/checkout', { cart, totalAmount, coupons });
  } catch (error) {
    console.error(error);
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

    // Fetch user's cart product details
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.redirect('/cart1');
    }

    // Calculate total amount
    let totalAmount = cart.items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    let discountAmount = 0;

    // Check if a coupon code is provided in the request
    const couponCode = req.body.couponCode;
    if (couponCode) {
      // Fetch the coupon from the database
      const coupon = await Coupon.findOne({ code: couponCode, expiryDate: { $gte: new Date() } });

      if (coupon) {
        // Validate the coupon (e.g., check if it's expired or already used)
        if (coupon.expiryDate >= new Date() && coupon.isActive) {
          // Calculate discount amount based on coupon type
          if (coupon.discountType === 'percentage') {
            discountAmount = (totalAmount * coupon.discountValue) / 100;
          } else if (coupon.discountType === 'fixed') {
            discountAmount = coupon.discountValue;
          }
        } else {
          return res.status(400).send('Coupon is expired or invalid.');
        }
      } else {
        return res.status(400).send('Invalid coupon code.');
      }
    }

    // Apply discount to the total amount
    const finalAmount = totalAmount - discountAmount;

    const paymentMethod = req.body.paymentMethod;

    if (paymentMethod === 'COD') {
      // Handle Cash on Delivery (COD) logic
      const order = new Order({
        user: userId,
        name: req.body.name,
        items: cart.items,
        totalAmount: finalAmount, // Use the discounted amount
        address: req.body.address,
        city: req.body.city,
        phone: req.body.phone,
        paymentMethod: 'COD', // Cash on delivery
        status: 'Order Placed', // Initial status
      });

      // Save the order to the database
      await order.save();

      // Clear the user's cart
      await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });

      return res.render('users/cod', { order });
    } else if (paymentMethod === 'Credit Card') {
      // Create a Stripe Checkout session
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
        billing_address_collection: 'required', // Collect address details
        phone_number_collection: {
          enabled: true, // Collect phone number
        },
        discounts: [
          {
            coupon: couponCode, // Apply the coupon code in Stripe (if supported)
          },
        ],
      });

      // Redirect to the Stripe Checkout page
      return res.redirect(303, session.url);
    } else {
      return res.status(400).send('Invalid payment method.');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};


module.exports = { renderCheckout, checkoutController };
