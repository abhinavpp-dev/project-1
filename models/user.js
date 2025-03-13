const mongoose = require('mongoose');


const addressSchema = new mongoose.Schema({
  fullName: { type: String, required: true }, // Full name for delivery
  mobile: { type: String, required: true },   // Contact number
  label: { type: String, required: true },    // e.g., Home, Work
  street: { type: String, required: true },
  landmark: { type: String },                 // Optional landmark
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true },
  deliveryInstructions: { type: String },     // Special instructions
  isDefault: { type: Boolean, default: false } // To manage default address
});

const userschema = new mongoose.Schema({
  fullName: { 
    type: String, 
    required: [true, 'Full name is required'],
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    unique: true,
    match: [/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please provide a valid email address']
  },
  mobile: { 
    type: String, 
    required: [true, 'Mobile number is required'],
    match: [/^\d{10}$/, 'Please provide a valid 10-digit mobile number']
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  otp: { 
    type: String, 
    default: null 
  },
  otpExpiry: { 
    type: Date, 
    default: null 
  },
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  resetPasswordToken: { 
    type: String, 
    default: null 
  },
  resetPasswordExpiry: { 
    type: Date, 
    default: null 
  },
  isBlocked: { 
    type: Boolean, 
    default: false 
  },
  addresses: [addressSchema]
});

module.exports = mongoose.model('User', userschema);
