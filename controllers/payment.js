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

    const { session_id } = req.query;
    if (!session_id) {
      return res.status(400).send('Missing payment session information.');
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === 'paid') {
      const cart = await Cart.findOne({ user: userId }).populate('items.product');
      if (!cart || cart.items.length === 0) {
        return res.redirect('/cart1');
      }

      let discountAmount = 0;
      if (session.total_details?.amount_discount) {
        discountAmount = session.total_details.amount_discount / 100;
      }

      const postalCode = session.customer_details.address.postal_code || '000000'; // Fallback if postalCode is missing

      const order = new Order({
        user: userId,
        name: session.customer_details.name,
        email: session.customer_details.email,
        items: cart.items,
        totalAmount: session.amount_total / 100,
        discountAmount,
        address: session.customer_details.address.line1,
        city: session.customer_details.address.city,
        postalCode,
        phone: session.customer_details.phone,
        paymentMethod: 'Credit Card',
        stripePaymentId: session.payment_intent,
        paymentStatus: 'Paid',
        status: 'Order Placed',
      });

      await order.save();
      await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });

      return res.render('users/paymentsucess', { order });
    } else {
      return res.status(400).send('Payment not confirmed.');
    }
  } catch (error) {
    console.error('Error in paymentsucess:', error);
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
