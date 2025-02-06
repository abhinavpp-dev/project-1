// document.getElementById('applyCouponButton').addEventListener('click', async () => {
//   const couponCode = document.getElementById('couponCode').value;
//   const totalAmount = parseFloat(document.getElementById('totalAmount').textContent.replace('₹', ''));

//   if (!couponCode) {
//     document.getElementById('couponMessage').textContent = 'Please enter a coupon code.';
//     return;
//   }

//   try {
//     const response = await fetch('/apply-coupon', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ couponCode, totalAmount }),
//     });

//     const data = await response.json();

//     if (response.ok) {
//       // Update the total amount on the page
//       document.getElementById('totalAmount').textContent = `₹${data.newTotal}`;
//       document.getElementById('couponMessage').textContent = data.message;
//       document.getElementById('couponMessage').style.color = 'green';

//       // Disable the coupon form fields after successful application
//       document.getElementById('couponCode').disabled = true;
//       document.getElementById('applyCouponButton').disabled = true;
//     } else {
//       document.getElementById('couponMessage').textContent = data.message;
//       document.getElementById('couponMessage').style.color = 'red';
//     }
//   } catch (error) {
//     console.error('Error applying coupon:', error);
//     document.getElementById('couponMessage').textContent = 'An error occurred. Please try again.';
//   }
// });


// Apply Coupon Logic
// document.getElementById('applyCouponButton').addEventListener('click', async () => {
//   const couponCode = document.getElementById('couponCode').value;
//   const totalAmount = document.getElementById('subtotalAmount').textContent.replace('₹', '');
//   const userId = "<%= user._id %>"; // Assuming user ID is available in EJS

//   if (!couponCode) {
//     document.getElementById('couponMessage').textContent = 'Please select a coupon.';
//     return;
//   }

//   try {
//     const response = await fetch('/apply-coupon', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ couponCode, totalAmount, userId }),
//     });
//     const data = await response.json();

//     if (response.ok) {
//       // Update visible total and discount
//       document.getElementById('totalAmount').textContent = `₹${data.newTotal}`;
//       document.getElementById('hiddenTotalAmount').value = data.newTotal;
//       if (data.discountAmount > 0) {
//         document.getElementById('discountAmount').textContent = `- ₹${data.discountAmount}`;
//       }

//       // Display success message
//       document.getElementById('couponMessage').textContent = data.message;
//       document.getElementById('couponMessage').style.color = 'green';
//     } else {
//       document.getElementById('couponMessage').textContent = data.message;
//       document.getElementById('couponMessage').style.color = 'red';
//     }
//   } catch (err) {
//     document.getElementById('couponMessage').textContent = 'An error occurred while applying the coupon.';
//   }
// });
