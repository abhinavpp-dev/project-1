
    $(document).ready(function () {
        // Handle Add to Cart Button Click
        $('.add-to-cart').on('click', function () {
            const productId = $(this).data('product-id');

            $.ajax({
                url: '/cart/add', // Backend route to add to cart
                method: 'POST',
                data: { productId },
                success: function (response) {
                    let notificationMessage;
                    let notificationClass;

                    if (response.success) {
                        notificationMessage = 'Item added to cart successfully!';
                        notificationClass = 'success';
                    } else {
                        notificationMessage = response.message || 'Error adding product to cart.';
                        notificationClass = 'error';
                    }

                    // Remove existing notifications to prevent duplicates
                    $('.cart-notification').remove();

                    // Create and append notification
                    const notification = $('<div class="cart-notification ' + notificationClass + '">' + notificationMessage + '</div>');
                    $('#toast-container').append(notification);

                    // Remove notification after 3 seconds
                    setTimeout(function () {
                        notification.fadeOut(500, function () {
                            $(this).remove();
                        });
                    }, 3000);

                    // Update cart item count in navbar
                    $('#cart-item-count').text(response.cartItemCount);
                },
                error: function () {
                    $('.cart-notification').remove(); // Remove existing notifications

                    const notification = $('<div class="cart-notification error">Error adding product to cart. Please try again.</div>');
                    $('#toast-container').append(notification);

                    setTimeout(function () {
                        notification.fadeOut(500, function () {
                            $(this).remove();
                        });
                    }, 3000);
                }
            });
        });
    });
