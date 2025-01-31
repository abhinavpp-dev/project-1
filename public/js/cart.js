$(document).ready(function () {
  $(".quantity-btn").click(function (event) {
    event.preventDefault();

    var productId = $(this).data("id");
    var action = $(this).data("action");
    var quantityDisplay = $(this).siblings(".quantity-display");
    var decreaseBtn = $(this).siblings(".decrease-btn");
    var productRow = $(this).closest("tr");
    var totalAmountElem = $("#totalAmount");
    var totalAmount = parseFloat(totalAmountElem.text().replace("₹", ""));

    // Disable buttons temporarily
    $(this).prop("disabled", true);

    $.ajax({
      url: "/cart/" + action,
      type: "POST",
      data: { productId: productId },
      success: function (response) {
        // Update the quantity
        var currentQuantity = parseInt(quantityDisplay.text());
        if (action === "increase") {
          currentQuantity += 1;
          totalAmount += parseFloat(
            productRow.find(".product-price").text().replace("₹", "")
          );
        } else if (action === "decrease") {
          currentQuantity -= 1;
          totalAmount -= parseFloat(
            productRow.find(".product-price").text().replace("₹", "")
          );
        }

        // Update the quantity display
        quantityDisplay.text(currentQuantity);

        // Disable decrease button if quantity is 1 or less
        if (currentQuantity <= 1) {
          decreaseBtn.prop("disabled", true);
        } else {
          decreaseBtn.prop("disabled", false);
        }

        // Update the total price for this item
        var price = parseFloat(
          productRow.find(".product-price").text().replace("₹", "")
        );
        productRow
          .find(".product-total")
          .text("₹" + (price * currentQuantity).toFixed(2));

        // Update the total amount displayed
        totalAmountElem.text("₹" + totalAmount.toFixed(2));

        // Re-enable the buttons
        $(".quantity-btn").prop("disabled", false);
      },
      error: function (xhr, status, error) {
        alert("There was an error updating the cart. Please try again.");
        $(".quantity-btn").prop("disabled", false);
      },
    });
  });

  // Check if any decrease button should be disabled on page load
  $(".quantity-display").each(function () {
    var quantity = parseInt($(this).text());
    var decreaseBtn = $(this).siblings(".decrease-btn");
    if (quantity <= 1) {
      decreaseBtn.prop("disabled", true);
    }
  });
});
