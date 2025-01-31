const mongoose = require('mongoose');

// Define the Slider schema
const sliderSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true, // Title of the slider
    },
    subtitle: {
      type: String,
      required: true, // Subtitle of the slider
    },
    images: [
      {
        imageUrl: {
          type: String,
          required: true, // URL of the slider image
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true, // Whether the slider is active or not
    },
    createdAt: {
      type: Date,
      default: Date.now, // Timestamp for when the slider was created
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Export the Slider model
const Slider = mongoose.model('Slider', sliderSchema);

module.exports = Slider;
