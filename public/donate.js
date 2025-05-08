document.addEventListener('DOMContentLoaded', function() {
    // PayPal Configuration
    const paypalButton = document.getElementById('paypalButton');
    if (paypalButton) {
        paypalButton.addEventListener('click', function(e) {
            e.preventDefault();
            window.open('https://paypal.me/joshholmes?country.x=US&locale.x=en_US', '_blank');
        });
    }

    // Venmo Configuration
    const venmoButton = document.getElementById('venmoButton');
    if (venmoButton) {
        venmoButton.addEventListener('click', function(e) {
            e.preventDefault();
            window.open('https://account.venmo.com/u/foreme', '_blank');
        });
    }

    // Cash App Configuration
    const cashAppButton = document.getElementById('cashAppButton');
    if (cashAppButton) {
        cashAppButton.addEventListener('click', function(e) {
            e.preventDefault();
            window.open('https://cash.app/$scottishinsults', '_blank');
        });
    }

    // Stripe Configuration
    const stripeForm = document.getElementById('stripeForm');
    if (stripeForm) {
        // Replace with your Stripe publishable key
        const stripe = Stripe('YOUR_STRIPE_PUBLISHABLE_KEY');
        const elements = stripe.elements();
        
        const card = elements.create('card', {
            style: {
                base: {
                    fontSize: '16px',
                    color: '#32325d',
                    '::placeholder': {
                        color: '#aab7c4'
                    }
                },
                invalid: {
                    color: '#fa755a',
                    iconColor: '#fa755a'
                }
            }
        });

        card.mount('#card-element');

        // Handle real-time validation errors
        card.addEventListener('change', function(event) {
            const displayError = document.getElementById('card-errors');
            if (event.error) {
                displayError.textContent = event.error.message;
            } else {
                displayError.textContent = '';
            }
        });

        // Handle form submission
        stripeForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const amount = document.getElementById('amount').value;
            const stripeButton = document.getElementById('stripeButton');
            
            // Disable the submit button to prevent repeated clicks
            stripeButton.disabled = true;
            stripeButton.innerHTML = '<img src="/public/images/credit-card.svg" alt="Card" class="payment-icon"> Donate with Card';

            try {
                const { token, error } = await stripe.createToken(card);

                if (error) {
                    const errorElement = document.getElementById('card-errors');
                    errorElement.textContent = error.message;
                    stripeButton.disabled = false;
                    stripeButton.innerHTML = '<img src="/public/images/credit-card.svg" alt="Card" class="payment-icon"> Donate with Card';
                } else {
                    // Send the token to your server
                    const response = await fetch('/api/donate', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            token: token.id,
                            amount: amount
                        })
                    });

                    const result = await response.json();

                    if (result.success) {
                        // Show success message
                        stripeForm.innerHTML = `
                            <div class="alert alert-success">
                                <h4>Thank you for your donation!</h4>
                                <p>Your support is greatly appreciated.</p>
                            </div>
                        `;
                    } else {
                        throw new Error(result.message || 'Payment failed');
                    }
                }
            } catch (error) {
                const errorElement = document.getElementById('card-errors');
                errorElement.textContent = error.message;
                stripeButton.disabled = false;
                stripeButton.innerHTML = '<img src="/public/images/credit-card.svg" alt="Card" class="payment-icon"> Donate with Card';
            }
        });
    }
}); 