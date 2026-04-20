// ========================================
// CHECKOUT.JS - Order Processing
// ========================================

let cart = JSON.parse(localStorage.getItem("cart")) || [];

function displayCheckoutCart() {
  const checkoutItems = document.getElementById("checkoutItems");
  if (!checkoutItems) return 0;
  
  checkoutItems.innerHTML = "";
  let total = 0;
  
  cart.forEach(item => {
    total += item.price * item.qty;
    checkoutItems.innerHTML += `<li>
      ${item.name} - ₱${item.price} x ${item.qty} = ₱${(item.price * item.qty).toFixed(2)}
    </li>`;
  });
  
  const totalElement = document.getElementById("checkoutTotal");
  if (totalElement) {
    totalElement.innerText = total.toFixed(2);
  }
  
  return total;
}

// Display cart on page load
document.addEventListener("DOMContentLoaded", () => {
  const totalPrice = displayCheckoutCart();
  
  // Show/hide card details based on payment method
  const paymentSelect = document.getElementById("paymentMethod");
  const cardDetails = document.getElementById("cardDetails");
  
  if (paymentSelect) {
    paymentSelect.addEventListener("change", () => {
      if (paymentSelect.value === "card") {
        cardDetails.style.display = "block";
      } else {
        cardDetails.style.display = "none";
      }
    });
  }

  // Handle form submission
  const checkoutForm = document.getElementById("checkoutForm");
  
  if (!checkoutForm) {
    console.error("❌ Checkout form not found!");
    return;
  }
  
  checkoutForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get form values
    const name = document.getElementById("fullName").value.trim();
    const address = document.getElementById("address").value.trim();
    const contact = document.getElementById("contact").value.trim();
    const payment = document.getElementById("paymentMethod").value;

    // Validation
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

    // Disable button during submission
    const submitBtn = checkoutForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Processing...";

    try {
      // Prepare order data
      const orderData = {
        customer_name: name,
        customer_address: address,
        customer_contact: contact,
        payment_method: payment,
        items: cart,
        total_amount: totalPrice
      };

      console.log("📤 Sending order:", orderData);

      // Send to PHP API - CORRECT PATH
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
        
        // Save order ID
        localStorage.setItem("lastOrderId", result.order_id);
        
        // Clear cart
        localStorage.removeItem("cart");
        
        // Redirect to home
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
});