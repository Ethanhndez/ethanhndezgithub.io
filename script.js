


let cart = [];
const cartDisplay = document.getElementById('cart');
const cartItems = document.getElementById('cart-items');
const totalDisplay = document.getElementById('total');

// Load cart from localStorage
window.addEventListener('load', () => {
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    updateCart();
});

// Add to cart
document.querySelectorAll('button[data-id]').forEach(btn => {
    btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const price = parseFloat(btn.dataset.price);
        cart.push({ id, price });
        updateCart();
    });
});

function updateCart() {
    const count = cart.length;
    if (cartDisplay) cartDisplay.textContent = `Cart (${count})`;
    if (cartItems && totalDisplay) {
        cartItems.innerHTML = cart.map(item => `<p>${item.id}: $${item.price}</p>`).join('');
        const total = cart.reduce((sum, item) => sum + item.price, 0);
        totalDisplay.textContent = total.toFixed(2);
    }
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Payment form submission
const form = document.getElementById('payment-form');
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const cardNumber = document.getElementById('card-number').value;
        const expiry = document.getElementById('card-expiry').value;
        const cvc = document.getElementById('card-cvc').value;

        const stripe = Stripe('pk_test_51S3lJk2Ov4E6xBVpdgamJLWLqqbImrilIVvHsbGVUB7QPcvEryz8eEJiaUde5pAqgvIiaENcGiLRPxYOqISULH0A00o52l6n4D'); // Replace with your Stripe publishable key
        const { token, error } = await stripe.createToken('card', {
            number: cardNumber,
            exp: expiry,
            cvc: cvc
        });

        if (error) {
            alert(error.message);
            return;
        }

        fetch('/charge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: token.id, amount: parseInt(totalDisplay.textContent * 100) }) // Amount in cents
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert('Payment successful!');
                cart = [];
                updateCart();
                window.location.href = 'index.html';
            } else {
                alert('Payment failed: ' + data.error);
            }
        });
    });
}