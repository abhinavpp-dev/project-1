const Coupon = require('../models/coupnmodel'); // Import the Coupon model

// Function to render coupons
const renderCoupon = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.render('admin/coupon', { coupons });
  } catch (err) {
    console.log(err);
    res.status(400).send('Internal server error');
  }
};

// Function to create a new coupon
const createCoupon = async (req, res) => {
  try {
    const { code, discount, expiryDate, usageLimit } = req.body;

    // Create a new coupon instance
    const newCoupon = new Coupon({
      code,
      discount,
      expiryDate,
      usageLimit,
      usedBy: [], // Initialize with an empty array
    });

    // Save the coupon to the database
    await newCoupon.save();
    res.redirect('/discounts')
  } catch (error) {
    res.status(500).json({ error: `Error creating coupon: ${error.message}` });
  }
};


const applycoupencode = async (req, res) => {
  try {
    const { couponCode, totalAmount } = req.body;

    // Validate input
    if (!couponCode || !totalAmount) {
      return res.status(400).json({ message: 'Coupon code and total amount are required.' });
    }

    // Find the coupon in the database
    const coupon = await Coupon.findOne({ code: couponCode });
    if (!coupon) {
      return res.status(400).json({ message: 'Invalid coupon code.' });
    }

    // Check if the coupon has expired
    if (new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ message: 'Coupon has expired.' });
    }

    // Check if the coupon has reached its usage limit
    if (coupon.usageLimit <= coupon.usedBy.length) {
      return res.status(400).json({ message: 'Coupon usage limit reached.' });
    }

    // Calculate the discount
    const totalAmountNumber = parseFloat(totalAmount);
    const discountAmount = (totalAmountNumber * coupon.discount) / 100;
    const newTotal = totalAmountNumber - discountAmount;

    // Respond with the new total and discount details
    return res.status(200).json({ 
      newTotal: newTotal.toFixed(2), 
      discountAmount: discountAmount.toFixed(2),
      message: 'Coupon applied successfully!'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    await Coupon.findByIdAndDelete(id);
    res.redirect('/discounts'); // Redirect back to the coupon management page
  } catch (error) {
    console.error('Error deleting coupon:', error);
    res.status(500).send('Internal Server Error');
  }
};






module.exports = { renderCoupon, createCoupon, applycoupencode ,deleteCoupon};
