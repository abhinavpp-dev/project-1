const Coupon = require('../models/coupnmodel');

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
    res.redirect('/discounts');
  } catch (error) {
    res.status(500).json({ error: `Error creating coupon: ${error.message}` });
  }
};

// Function to apply coupon code at checkout
const applycoupencode = async (req, res) => {
  try {
    const { couponCode, userId, totalAmount } = req.body;

    let discountAmount = 0;
    let message = '';

    // Check if coupon is valid
    const coupon = await Coupon.findOne({
      code: couponCode,
      expiryDate: { $gte: new Date() },
      usageLimit: { $gt: 0 }
    });

    if (!coupon) {
      message = 'Invalid or expired coupon code.';
      return res.status(400).json({ message });
    }

    // Check if the user has already used the coupon
    if (coupon.usedBy.includes(userId)) {
      message = 'You have already used this coupon.';
      return res.status(400).json({ message });
    }

    // Calculate discount amount
    discountAmount = (coupon.discount / 100) * totalAmount;
    const updatedTotalAmount = totalAmount - discountAmount;

    // Update coupon usage
    coupon.usedBy.push(userId);
    coupon.usageLimit -= 1;
    await coupon.save();

    // Only show success message if coupon is successfully applied
    message = 'Coupon applied successfully!';

    return res.json({ newTotal: updatedTotalAmount.toFixed(2), message });
  } catch (error) {
    console.error('Error applying coupon:', error);
    res.status(500).json({ message: 'An error occurred while applying the coupon.', error: error.message });
  }
};



// Function to delete coupon
const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    await Coupon.findByIdAndDelete(id);
    res.redirect('/discounts');
  } catch (error) {
    console.error('Error deleting coupon:', error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = { renderCoupon, createCoupon, applycoupencode, deleteCoupon };
