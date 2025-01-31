const mongoose = require('mongoose');

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
  }
});

module.exports = mongoose.model('User', userschema);
