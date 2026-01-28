const API_URL = 'http://localhost:3000/api';
let cart = [];
let menuItems = [];

// DOM Elements
const menuContainer = document.getElementById('menu-container');
const cartItemsContainer = document.getElementById('cart-items');
const totalPriceElement = document.getElementById('total-price');
const orderForm = document.getElementById('order-form');
const confirmationSection = document.getElementById('confirmation-section');
const menuSection = document.getElementById('menu-section');
const orderSummarySection = document.getElementById('order-summary');

// Fetch Menu on Load
document.addEventListener('DOMContentLoaded', fetchMenu);

function fetchMenu() {
    fetch(`${API_URL}/menu`)
        .then(response => response.json())
        .then(data => {
            if (data.message === 'success') {
                menuItems = data.data;
                renderMenu(menuItems);
            } else {
                menuContainer.innerHTML = '<p>Failed to load menu.</p>';
            }
        })
        .catch(err => {
            console.error('Error fetching menu:', err);
            menuContainer.innerHTML = '<p>Error loading menu. Is the backend running?</p>';
        });
}

function renderMenu(items) {
    menuContainer.innerHTML = '';
    items.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'menu-item';

        // Try to use image from images folder, fallback to placeholder
        const imageName = item.image || `${item.name.toLowerCase().replace(/\s+/g, '-')}.png`;
        const imagePath = `images/${imageName}`;

        itemDiv.innerHTML = `
            <div class="menu-item-image">
                <img src="${imagePath}" alt="${item.name}" onerror="this.style.display='none'; this.parentElement.innerHTML='🍽️';">
            </div>
            <div class="menu-item-content">
                <h3>${item.name}</h3>
                <p>${item.description || 'Delicious dish prepared with care and fresh ingredients.'}</p>
                <div class="menu-item-footer">
                    <span class="price">₹${item.price.toFixed(2)}</span>
                    <button class="add-btn" onclick="addToCart(${item.id})">Add to Order</button>
                </div>
            </div>
        `;
        menuContainer.appendChild(itemDiv);
    });
}

function addToCart(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    if (!item) return;

    const existingItem = cart.find(i => i.id === itemId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...item, quantity: 1 });
    }
    updateCartUI();
}

function updateCartUI() {
    cartItemsContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
    } else {
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            const cartItemDiv = document.createElement('div');
            cartItemDiv.className = 'cart-item';
            cartItemDiv.innerHTML = `
                <div class="cart-item-info">
                    <span class="cart-item-name">${item.name}</span>
                    <span class="cart-item-quantity">Quantity: ${item.quantity}</span>
                </div>
                <span class="cart-item-price">₹${itemTotal.toFixed(2)}</span>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
            `;
            cartItemsContainer.appendChild(cartItemDiv);
        });
    }

    totalPriceElement.textContent = total.toFixed(2);
}

function removeFromCart(itemId) {
    const itemIndex = cart.findIndex(i => i.id === itemId);
    if (itemIndex > -1) {
        const item = cart[itemIndex];
        if (item.quantity > 1) {
            item.quantity -= 1;
        } else {
            cart.splice(itemIndex, 1);
        }
        updateCartUI();
    }
}


// Handle Order Submission
orderForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (cart.length === 0) {
        alert('Please add items to your order first!');
        return;
    }

    const nameInput = document.getElementById('customer-name');
    const phoneInput = document.getElementById('customer-phone');
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();

    // Validation 1: Name should not contain numbers
    // Regex checks if there is any digit (0-9) in the string
    if (/\d/.test(name)) { // \d matches any digit
        alert('Please enter letters only for the name.');
        nameInput.focus();
        return;
    }

    // Validation 2: Phone should not contain letters
    // Regex checks if there is any letter (a-z, A-Z) in the string
    if (/[a-zA-Z]/.test(phone)) {
        alert('Please enter numbers only for the phone number.');
        phoneInput.focus();
        return;
    }

    const totalAmount = parseFloat(totalPriceElement.textContent);

    const orderData = {
        customer_name: name,
        customer_phone: phone,
        total_amount: totalAmount,
        items: cart.map(item => ({
            id: item.id,
            quantity: item.quantity,
            price: item.price
        }))
    };

    submitOrder(orderData);
});

function submitOrder(orderData) {
    fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
    })
        .then(response => response.json())
        .then(data => {
            if (data.order_id) {
                showConfirmation(data.order_id, orderData.customer_name);
            } else {
                alert('Error placing order: ' + (data.error || 'Unknown error'));
            }
        })
        .catch(err => {
            console.error('Error submitting order:', err);
            alert('Failed to submit order.');
        });
}

function showConfirmation(orderId, customerName) {
    menuSection.classList.add('hidden');
    orderSummarySection.classList.add('hidden');
    confirmationSection.classList.remove('hidden');

    document.getElementById('conf-name').textContent = customerName;
    document.getElementById('conf-id').textContent = orderId;
}
