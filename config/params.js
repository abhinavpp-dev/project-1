// config/params.js
let folder = 'menu';
let allowedFormats = ['jpg', 'jpeg', 'png', 'webp'];

try {
  const params = require('../config/params');
  folder = params.folder || folder;
  allowedFormats = params.allowedFormats || allowedFormats;
} catch (err) {
  console.warn('params.js not found or invalid, using default values.');
}

module.exports = {
  folder: 'menu',
  allowedFormats: ['jpg', 'jpeg', 'png', 'webp']
};
