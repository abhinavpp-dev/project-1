require('dotenv').config();
const mongoose = require('mongoose');
const Coupon = require('./models/coupnmodel'); // Adjust the path to your Coupon model

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected successfully');
  syncCoupons();
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

async function syncCoupons() {
  try {
    const coupons = await Coupon.find({});
    console.log('Coupons found:', coupons);

    // Simulate syncing with Stripe
    for (let coupon of coupons) {
      console.log(`Syncing coupon with code: ${coupon.code}`);
      // Replace this with your actual Stripe coupon creation logic
      await fakeStripeSync(coupon);
    }

    console.log('All coupons synced successfully.');
    process.exit(0); // Exit the process once syncing is complete
  } catch (error) {
    console.error('Error syncing coupons:', error);
    process.exit(1);
  }
}

// Simulate a Stripe sync function (replace with real Stripe API code)
async function fakeStripeSync(coupon) {
  return new Promise((resolve) => {
    console.log(`Pretending to sync coupon ${coupon.code} with Stripe...`);
    setTimeout(resolve, 1000);
  });
}
