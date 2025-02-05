const Order = require('../models/order');
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_SECRETKEY);
const Cart = require('../models/cartmodel');

const paymentsucess = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.redirect('/login');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Retrieve Stripe session_id from query params
    const { session_id } = req.query;
    if (!session_id) {
      return res.status(400).send('Missing payment session information.');
    }

    // Fetch session details from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === 'paid') {
      // Fetch the user's cart
      const cart = await Cart.findOne({ user: userId }).populate('items.product');
      if (!cart) {
        return res.redirect('/cart1');
      }

      // Extract discount details from Stripe (if applicable)
      let discountAmount = 0;
      if (session.total_details?.amount_discount) {
        discountAmount = session.total_details.amount_discount / 100; // Convert paise to INR
      }

      // Save the order
      const order = new Order({
        user: userId,
        name: session.customer_details.name,
        items: cart.items,
        totalAmount: session.amount_total / 100, // Stripe returns amounts in cents
        discount: discountAmount, // Store discount details
        address: session.customer_details.address.line1,
        city: session.customer_details.address.city,
        phone: session.customer_details.phone,
        paymentMethod: 'Credit Card',
        status: 'Paid',
      });

      await order.save();

      // Clear the cart
      await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });

      // Render the success page
      return res.render('users/paymentsucess', { order });
    } else {
      return res.status(400).send('Payment not confirmed.');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
};

const cancelpayment = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.redirect('/login');
    }
    res.render('users/paymentcancel');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
};

module.exports = { paymentsucess, cancelpayment };
