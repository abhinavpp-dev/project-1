const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    password: {
        type: String,
        required: true,
        trim: true
        // Plain text password (NOT RECOMMENDED in production)
    },
    role: {
        type: String,
        default: 'admin'
        // Can be used to manage roles in case you expand functionality
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date
        // This can be updated whenever the admin logs in
    }
});

module.exports = mongoose.model('Admin', adminSchema);
