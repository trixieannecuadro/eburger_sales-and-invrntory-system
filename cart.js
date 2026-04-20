// ========================================
// CART.JS - Shopping Cart Management
// ========================================

let cart = JSON.parse(localStorage.getItem("cart")) || [];

function addToCart(name, price, imgSrc) {
  let existing = cart.find(i => i.name === name);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name, price, qty: 1, img: imgSrc });
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  displayCart();
  openCart();
  showAddedNotification(name);
}

function showAddedNotification(itemName) {
  const notification = document.createElement('div');
  notification.className = 'add-notification';
  notification.textContent = `✅ ${itemName} added to cart!`;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

function displayCart() {
  const cartItems = document.getElementById("cartItems");
  if (!cartItems) return;
  
  if (cart.length === 0) {
    cartItems.innerHTML = "<p style='color: #fff; text-align: center; padding: 20px;'>Your cart is empty</p>";
    updateCartCount();
    return;
  }
  
  cartItems.innerHTML = "";
  let total = 0;
  let count = 0;
  
  cart.forEach((item, index) => {
    total += item.price * item.qty;
    count += item.qty;
    
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.innerHTML = `
      <img src="${item.img}" alt="${item.name}" class="cart-item-img">
      <div class="cart-item-details">
        <strong class="cart-item-name">${item.name}</strong>
        <div class="cart-item-price">₱${item.price.toFixed(2)}</div>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="changeQty(${index}, -1)">−</button> 
          <span class="qty-display">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${index}, 1)">+</button>
          <button class="remove-btn" onclick="removeFromCart(${index})">Remove</button>
        </div>
      </div>
    `;
    cartItems.appendChild(cartItem);
  });
  
  const totalElement = document.getElementById("total");
  if (totalElement) {
    totalElement.textContent = total.toFixed(2);
  }
  
  updateCartCount(count);
}

function updateCartCount(count = 0) {
  const cartCount = document.getElementById("cartCount");
  if (cartCount) {
    if (count === 0) {
      count = cart.reduce((sum, item) => sum + item.qty, 0);
    }
    cartCount.textContent = count;
  }
}

function changeQty(index, delta) {
  if (index >= 0 && index < cart.length) {
    cart[index].qty += delta;
    if (cart[index].qty <= 0) {
      cart.splice(index, 1);
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    displayCart();
  }
}

function removeFromCart(index) {
  if (index >= 0 && index < cart.length) {
    const itemName = cart[index].name;
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    displayCart();
    showRemovedNotification(itemName);
  }
}

function showRemovedNotification(itemName) {
  const notification = document.createElement('div');
  notification.className = 'remove-notification';
  notification.textContent = `❌ ${itemName} removed from cart`;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

function openCart() {
  const sidebar = document.getElementById("cartSidebar");
  if (sidebar) {
    sidebar.classList.add("open");
  }
}

function closeCart() {
  const sidebar = document.getElementById("cartSidebar");
  if (sidebar) {
    sidebar.classList.remove("open");
  }
}

function goCheckout() {
  window.location.href = "checkout.html";
}

// Close cart when clicking outside
document.addEventListener('click', function(event) {
  const sidebar = document.getElementById("cartSidebar");
  const cartButton = document.querySelector('.cart-icon');
  
  if (sidebar && !sidebar.contains(event.target) && !cartButton.contains(event.target)) {
    if (sidebar.classList.contains('open')) {
      closeCart();
    }
  }
});

// Handle checkout form submission
document.addEventListener('DOMContentLoaded', function() {
  const checkoutForm = document.getElementById("checkoutForm");
  
  if (checkoutForm) {
    checkoutForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("fullName").value.trim();
      const address = document.getElementById("address").value.trim();
      const contact = document.getElementById("contact").value.trim();
      const payment = document.getElementById("paymentMethod").value;

      if (!name || !address || !contact || !payment) {
        alert("❌ Please fill all fields!");
        return;
      }

      if (payment === "card") {
        const cardNum = document.getElementById("cardNumber").value.trim();
        const expiry = document.getElementById("expiry").value.trim();
        const cvv = document.getElementById("cvv").value.trim();
        
        if (!cardNum || !expiry || !cvv) {
          alert("❌ Please fill card details!");
          return;
        }
      }

      if (cart.length === 0) {
        alert("❌ Cart is empty!");
        return;
      }

      const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

      const submitBtn = checkoutForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = "Processing...";

      try {
        const orderData = {
          customer_name: name,
          customer_address: address,
          customer_contact: contact,
          payment_method: payment,
          items: cart,
          total_amount: totalAmount
        };

        console.log("📤 Sending order:", orderData);

        const response = await fetch('./api/orders/create_order.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(orderData)
        });

        const result = await response.json();
        console.log("📥 Server response:", result);

        if (result.success) {
          alert("✅ Order placed successfully!\nOrder ID: " + result.order_id);
          localStorage.setItem("lastOrderId", result.order_id);
          localStorage.removeItem("cart");
          cart = [];
          displayCart();
          closeCart();
          
          setTimeout(() => {
            window.location.href = "./index.html";
          }, 1500);
        } else {
          alert("❌ Error: " + (result.error || "Failed to create order"));
          submitBtn.disabled = false;
          submitBtn.textContent = "Place Order";
        }
      } catch (error) {
        console.error('❌ Order error:', error);
        alert("❌ Connection error. Please try again.\n\nError: " + error.message);
        submitBtn.disabled = false;
        submitBtn.textContent = "Place Order";
      }
    });
  }

  // Handle payment method change
  const paymentSelect = document.getElementById("paymentMethod");
  const cardDetails = document.getElementById("cardDetails");
  
  if (paymentSelect) {
    paymentSelect.addEventListener("change", () => {
      if (cardDetails) {
        cardDetails.style.display = paymentSelect.value === "card" ? "block" : "none";
      }
    });
  }

  // Initialize cart display
  displayCart();
});