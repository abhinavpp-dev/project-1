// Function to automatically move focus to the next input field when the user types a number
function moveFocus(currentInput, nextInputIndex) {
  // Check if the current input field is filled with one character
  if (currentInput.value.length === 1) {
    // Move focus to the next input field
    const nextInput = document.querySelectorAll('.otp-input-container input')[nextInputIndex];
    if (nextInput) nextInput.focus();
  }
}

// Function to handle backspace key and move focus to the previous input field if needed
function handleBackspace(event, currentInput, prevInputIndex) {
  if (event.key === 'Backspace' && currentInput.value.length === 0) {
    // Move focus to the previous input field when backspace is pressed
    const prevInput = document.querySelectorAll('.otp-input-container input')[prevInputIndex];
    if (prevInput) prevInput.focus();
  }
}

// Add event listeners for each input field
document.querySelectorAll('.otp-input-container input').forEach((input, index) => {
  input.addEventListener('input', () => moveFocus(input, index + 1)); // Move focus after input
  input.addEventListener('keydown', (event) => handleBackspace(event, input, index - 1)); // Handle backspace
});
