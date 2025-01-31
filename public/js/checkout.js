document.getElementById('applyCouponButton').addEventListener('click', async () => {
  const couponCode = document.getElementById('couponCode').value;
  const totalAmount = parseFloat(document.getElementById('totalAmount').textContent.replace('₹', ''));

  if (!couponCode) {
    document.getElementById('couponMessage').textContent = 'Please enter a coupon code.';
    return;
  }

  try {
    const response = await fetch('/apply-coupon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ couponCode, totalAmount }),
    });

    const data = await response.json();

    if (response.ok) {
      // Update the total amount on the page
      document.getElementById('totalAmount').textContent = `₹${data.newTotal}`;
      document.getElementById('couponMessage').textContent = data.message;
      document.getElementById('couponMessage').style.color = 'green';

      // Disable the coupon form fields after successful application
      document.getElementById('couponCode').disabled = true;
      document.getElementById('applyCouponButton').disabled = true;
    } else {
      document.getElementById('couponMessage').textContent = data.message;
      document.getElementById('couponMessage').style.color = 'red';
    }
  } catch (error) {
    console.error('Error applying coupon:', error);
    document.getElementById('couponMessage').textContent = 'An error occurred. Please try again.';
  }
});
