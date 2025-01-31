const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [cartItemSchema],
  },
  { timestamps: true } // Automatically add createdAt and updatedAt
);

// Remove a product from the cart
cartSchema.methods.removeProduct = function (productId) {
  this.items = this.items.filter(
    (item) => item.product.toString() !== productId.toString()
  );
  return this.save();
};

// Increase quantity of a product in the cart
cartSchema.methods.increaseQuantity = function (productId) {
  const item = this.items.find(
    (item) => item.product.toString() === productId.toString()
  );
  if (item) {
    item.quantity += 1;
    return this.save();
  }
  throw new Error('Product not found in cart');
};

// Decrease quantity of a product in the cart
cartSchema.methods.decreaseQuantity = function (productId) {
  const item = this.items.find(
    (item) => item.product.toString() === productId.toString()
  );
  if (item && item.quantity > 1) {
    item.quantity -= 1;
    return this.save();
  } else if (item) {
    throw new Error('Quantity cannot be less than 1');
  } else {
    throw new Error('Product not found in cart');
  }
};

// Clear the cart after checkout
cartSchema.methods.clearCart = function () {
  this.items = [];
  return this.save();
};

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
