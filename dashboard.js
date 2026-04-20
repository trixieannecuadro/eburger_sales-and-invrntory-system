// ========================================
// DASHBOARD INITIALIZATION & UTILITIES
// ========================================

document.addEventListener('DOMContentLoaded', function() {
  console.log("Dashboard loading...");
  
  // Initialize with test data if empty
  if (!localStorage.getItem("orders")) {
    console.log("No data found, initializing test data...");
    initializeTestData();
  }
  
  // Default section
  setActiveSection('dashboard');
  
  // Give DOM time to settle, then load all data
  setTimeout(() => {
    console.log("Loading dashboard data...");
    loadDashboard();
    setupEventListeners();
    checkExpiringItems();
    setInterval(checkExpiringItems, 3600000); // Check every hour
    
    // Start polling for real-time updates
    setInterval(pollForChanges, 2000); // Check every 2 seconds
    updateLastStates(); // Initialize last states
  }, 200);
});

// Global variables for confirm modal
let confirmCallback = null;

// Store last known states for polling
let lastOrdersState = localStorage.getItem("orders");
let lastInventoryState = localStorage.getItem("inventory");
let lastProductsState = localStorage.getItem("products");
let lastSalesState = localStorage.getItem("sales");

// Initialize with test data on first load
function initializeTestData() {
  const today = new Date();
  
  // Test orders
  const testOrders = [
    {
      id: "ORD001",
      customer: { name: "John Doe" },
      items: [{ name: "Cheese Burger", qty: 2 }, { name: "Fries", qty: 1 }],
      total: 300,
      status: "Pending"
    },
    {
      id: "ORD002",
      customer: { name: "Jane Smith" },
      items: [{ name: "Buffalo Wings", qty: 3 }, { name: "Coke", qty: 2 }],
      total: 450,
      status: "Preparing"
    },
    {
      id: "ORD003",
      customer: { name: "Mike Johnson" },
      items: [{ name: "Mayon Burger", qty: 1 }, { name: "Sprite", qty: 1 }],
      total: 220,
      status: "Ready"
    }
  ];
  
  // Test products with expiration dates
  const testProducts = [
    {
      id: 1,
      name: "Cheese Burger",
      price: 120,
      stock: 50,
      category: "burgers",
      createdAt: today.toLocaleDateString()
    },
    {
      id: 2,
      name: "Buffalo Wings",
      price: 100,
      stock: 30,
      category: "wings",
      createdAt: today.toLocaleDateString()
    },
    {
      id: 3,
      name: "Spicy Wings",
      price: 190,
      stock: 20,
      category: "wings",
      createdAt: today.toLocaleDateString()
    },
    {
      id: 4,
      name: "Fries",
      price: 60,
      stock: 0,
      category: "burgers",
      createdAt: today.toLocaleDateString()
    }
  ];
  
  // Test inventory
  const testInventory = [
    { id: 1, ingredient: "Beef Patty", stock: 50, unit: "pcs", expiryDate: new Date(today.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], addedAt: today.toLocaleDateString() },
    { id: 2, ingredient: "Cheese Slices", stock: 100, unit: "pcs", expiryDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], addedAt: today.toLocaleDateString() },
    { id: 3, ingredient: "Lettuce", stock: 3, unit: "kg", expiryDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], addedAt: today.toLocaleDateString() },
    { id: 4, ingredient: "Tomato", stock: 0, unit: "kg", expiryDate: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], addedAt: today.toLocaleDateString() },
    { id: 5, ingredient: "Chicken Wings", stock: 25, unit: "kg", expiryDate: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], addedAt: today.toLocaleDateString() }
  ];
  
  localStorage.setItem("orders", JSON.stringify(testOrders));
  localStorage.setItem("products", JSON.stringify(testProducts));
  localStorage.setItem("inventory", JSON.stringify(testInventory));
  
  // Initialize test sales data
  const testSales = [
    {
      orderId: "ORD-001",
      items: [{name: "Cheese Burger", qty: 2, price: 120}, {name: "Coke", qty: 1, price: 50}],
      totalSales: 290,
      date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000
    },
    {
      orderId: "ORD-002",
      items: [{name: "Buffalo Wings", qty: 1, price: 100}, {name: "Sprite", qty: 2, price: 50}],
      totalSales: 200,
      date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000
    },
    {
      orderId: "ORD-003",
      items: [{name: "Cheese Burger", qty: 1, price: 120}, {name: "Fries", qty: 2, price: 60}],
      totalSales: 240,
      date: today.toISOString(),
      timestamp: Date.now()
    }
  ];
  
  localStorage.setItem("sales", JSON.stringify(testSales));
  
  // Initialize daily sales tracking
  const testDailySales = {};
  testDailySales[new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toDateString()] = 490;
  testDailySales[today.toDateString()] = 240;
  localStorage.setItem("dailySales", JSON.stringify(testDailySales));
}

// Logout functionality
function logout() {
  window.location.href = "../login.html";
}

// Refresh dashboard function
function refreshDashboard() {
  loadDashboard();
  checkExpiringItems();
}

document.getElementById("logoutBtn").addEventListener("click", logout);
// document.getElementById("desktopLogout").addEventListener("click", logout);

// Section switching helpers
function setActiveSection(sectionId) {
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));

  const link = document.querySelector(`.nav-link[href="#${sectionId}"]`);
  if (link) link.classList.add('active');

  const section = document.getElementById(sectionId);
  if (section) {
    section.classList.add('active');
  }
}

// Real-time updates when localStorage changes (e.g., from checkout in another tab)
window.addEventListener('storage', function(e) {
  if (e.key === 'orders' || e.key === 'inventory' || e.key === 'products' || e.key === 'sales') {
    console.log(`Storage changed: ${e.key}, refreshing dashboard...`);
    loadDashboard();
    updateLastStates();
  }
});

// Polling function for real-time updates in same tab
function pollForChanges() {
  const currentOrders = localStorage.getItem("orders");
  const currentInventory = localStorage.getItem("inventory");
  const currentProducts = localStorage.getItem("products");
  const currentSales = localStorage.getItem("sales");
  
  let hasChanged = false;
  
  if (currentOrders !== lastOrdersState) {
    console.log("Orders changed via polling, refreshing...");
    hasChanged = true;
  }
  if (currentInventory !== lastInventoryState) {
    console.log("Inventory changed via polling, refreshing...");
    hasChanged = true;
  }
  if (currentProducts !== lastProductsState) {
    console.log("Products changed via polling, refreshing...");
    hasChanged = true;
  }
  if (currentSales !== lastSalesState) {
    console.log("Sales changed via polling, refreshing...");
    hasChanged = true;
  }
  
  if (hasChanged) {
    loadDashboard();
    updateLastStates();
  }
}

function updateLastStates() {
  lastOrdersState = localStorage.getItem("orders");
  lastInventoryState = localStorage.getItem("inventory");
  lastProductsState = localStorage.getItem("products");
  lastSalesState = localStorage.getItem("sales");
}

// Navigation setup with proper section visibility
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', function(e) {
    const href = this.getAttribute('href');

    if (this.id === 'logoutBtn') {
      return; // logout handled explicitly elsewhere
    }

    if (href === '#' || !href.startsWith('#')) {
      e.preventDefault();
      return;
    }

    e.preventDefault();
    const target = href.substring(1); // Remove # from href
    console.log(`Switching dashboard section -> ${target}`);
    setActiveSection(target);

    // Reload data for the selected section
    if (target === 'orders') loadOrders();
    else if (target === 'products') loadProducts();
    else if (target === 'inventory') loadInventory();
    else if (target === 'expiring') loadExpiringItems();
    else if (target === 'sales') loadSalesReport();
    else if (target === 'dashboard') {
      updateStats();
      checkExpiringItems();
    }
  });
});

function setupEventListeners() {
  // Modal close on outside click
  document.getElementById('productModal').addEventListener('click', function(e) {
    if (e.target === this) closeProductModal();
  });
  
  document.getElementById('inventoryModal').addEventListener('click', function(e) {
    if (e.target === this) closeInventoryModal();
  });

  document.getElementById('confirmModal').addEventListener('click', function(e) {
    if (e.target === this) closeConfirmModal();
  });
}

// ========================================
// DASHBOARD LOADING
// ========================================

function loadDashboard() {
  updateStats();
  loadOrders();
  loadProducts();
  loadInventory();
  loadExpiringItems();
  loadSalesReport();
}

function updateStats() {
  // Total Orders
  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  document.getElementById("totalOrders").innerText = orders.length;
  document.getElementById("headerTotalOrders").innerText = orders.length;
  
  // Total Revenue
  let totalRevenue = 0;
  orders.forEach(order => {
    totalRevenue += parseFloat(order.total) || 0;
  });
  document.getElementById("totalRevenue").innerText = `₱${totalRevenue.toFixed(2)}`;
  document.getElementById("headerTotalRevenue").innerText = `₱${totalRevenue.toFixed(2)}`;
  
  // Total Products
  const products = JSON.parse(localStorage.getItem("products")) || [];
  document.getElementById("totalProducts").innerText = products.length;
  
  // Low Stock Items
  const inventory = JSON.parse(localStorage.getItem("inventory")) || [];
  const lowStock = inventory.filter(i => parseFloat(i.stock) < 5).length;
  document.getElementById("lowStockItems").innerText = lowStock;
  document.getElementById("headerLowStock").innerText = lowStock;
}

// ========================================
// ORDERS SECTION
// ========================================

function loadOrders() {
  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  const tbody = document.getElementById("ordersTableBody");
  tbody.innerHTML = "";
  
  if (orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No orders yet</td></tr>';
    return;
  }
  
  orders.forEach((order, index) => {
    const itemsStr = order.items ? order.items.map(item => `${item.qty}x ${item.name}`).join(", ") : "N/A";
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${order.id || 'N/A'}</td>
      <td>${order.customer?.name || 'Walk-in'}</td>
      <td>${itemsStr}</td>
      <td>₱${(order.total || 0).toFixed(2)}</td>
      <td><span class="admin-badge ${getBadgeClass(order.status)}">${order.status || 'Pending'}</span></td>
      <td style="white-space: nowrap;">
        <select onchange="updateOrderStatus(${index}, this.value)" style="padding: 6px 8px; border-radius: 4px; border: 1px solid #ddd; font-size: 12px; margin-right: 8px;">
          <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
          <option value="Preparing" ${order.status === 'Preparing' ? 'selected' : ''}>Preparing</option>
          <option value="Ready" ${order.status === 'Ready' ? 'selected' : ''}>Ready</option>
          <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
          <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
        <button class="btn-delete" onclick="deleteOrder(${index})">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function getBadgeClass(status) {
  switch(status) {
    case 'Delivered': return 'success';
    case 'Ready': return 'success';
    case 'Preparing': return 'warning';
    case 'Cancelled': return 'danger';
    default: return 'info';
  }
}

function updateOrderStatus(index, newStatus) {
  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  if (orders[index]) {
    orders[index].status = newStatus;
    localStorage.setItem("orders", JSON.stringify(orders));
    loadOrders();
    updateStats();
  }
}

function deleteOrder(index) {
  showConfirmModal('Are you sure you want to delete this order?', () => {
    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    orders.splice(index, 1);
    localStorage.setItem("orders", JSON.stringify(orders));
    loadOrders();
    updateStats();
  });
}

function clearAllOrders() {
  showConfirmModal('Are you sure you want to clear ALL orders? This cannot be undone!', () => {
    localStorage.removeItem("orders");
    loadOrders();
    updateStats();
    alert('All orders have been cleared!');
  });
}

// ========================================
// PRODUCTS SECTION
// ========================================

function openProductModal() {
  console.log("Opening product modal...");
  const modal = document.getElementById('productModal');
  if (!modal) {
    console.error("ERROR: productModal not found!");
    return;
  }
  modal.classList.add('show');
  // Clear form
  const inputs = ['productName', 'productPrice', 'productStock', 'productCategory', 'productDescription'];
  inputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  document.getElementById('productCategory').value = 'burgers';
  console.log("Product modal opened successfully");
}

function closeProductModal() {
  console.log("Closing product modal...");
  const modal = document.getElementById('productModal');
  if (modal) {
    modal.classList.remove('show');
    // Reset editing state
    delete modal.dataset.editingIndex;
    document.getElementById('productModalTitle').textContent = 'Add New Product';
    document.getElementById('productSubmitBtn').textContent = 'Add Product';
  }
}

function saveProduct() {
  const name = document.getElementById("productName").value.trim();
  const price = parseFloat(document.getElementById("productPrice").value);
  const stock = parseInt(document.getElementById("productStock").value);
  const category = document.getElementById("productCategory").value;
  const description = document.getElementById("productDescription").value.trim();
  
  if (!name || !price || isNaN(stock) || !category) {
    alert('Please fill in all required fields!');
    return;
  }
  
  if (isNaN(price) || price < 0) {
    alert('Please enter a valid price!');
    return;
  }
  
  if (isNaN(stock) || stock < 0) {
    alert('Please enter a valid stock quantity!');
    return;
  }
  
  const products = JSON.parse(localStorage.getItem("products")) || [];
  const modal = document.getElementById('productModal');
  const editingIndex = modal.dataset.editingIndex;
  
  if (editingIndex !== undefined && editingIndex !== null && editingIndex !== "") {
    // Update existing product
    products[editingIndex] = {
      ...products[editingIndex],
      name: name,
      price: price,
      stock: stock,
      category: category,
      description: description
    };
    alert('Product updated successfully!');
  } else {
    // Add new product
    products.push({
      id: Date.now(),
      name: name,
      price: price,
      stock: stock,
      category: category,
      description: description,
      createdAt: new Date().toLocaleDateString()
    });
    alert('Product added successfully!');
  }
  
  localStorage.setItem("products", JSON.stringify(products));
  closeProductModal();
  loadProducts();
  updateStats();
}

function loadProducts() {
  const products = JSON.parse(localStorage.getItem("products")) || [];
  const tbody = document.getElementById("productsTableBody");
  tbody.innerHTML = "";
  
  if (products.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No products added yet</td></tr>';
    return;
  }
  
  products.forEach((product, index) => {
    let statusClass = 'success';
    let statusText = 'In Stock';
    if (product.stock <= 0) {
      statusClass = 'danger';
      statusText = 'Out of Stock';
    } else if (product.stock < 10) {
      statusClass = 'warning';
      statusText = 'Low Stock';
    }
    
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><strong>${product.name}</strong></td>
      <td>₱${product.price.toFixed(2)}</td>
      <td>${product.stock || 0}</td>
      <td>${product.category || 'n/a'}</td>
      <td><span class="admin-badge ${statusClass}">${statusText}</span></td>
      <td>
        <button class="btn-warning" onclick="editProduct(${index})" style="margin-right: 5px;">Edit</button>
        <button class="btn-danger" onclick="deleteProduct(${index})">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function editProduct(index) {
  const products = JSON.parse(localStorage.getItem("products")) || [];
  const product = products[index];
  
  // Populate the modal with existing data
  document.getElementById('productName').value = product.name;
  document.getElementById('productPrice').value = product.price;
  document.getElementById('productStock').value = product.stock || 0;
  document.getElementById('productCategory').value = product.category || '';
  document.getElementById('productDescription').value = product.description || '';
  
  // Set editing mode
  document.getElementById('productModal').dataset.editingIndex = index;
  document.getElementById('productModalTitle').textContent = 'Edit Product';
  document.getElementById('productSubmitBtn').textContent = 'Update Product';
  
  // Open modal
  document.getElementById('productModal').classList.add('show');
}

function deleteProduct(index) {
  showConfirmModal('Are you sure you want to delete this product?', () => {
    const products = JSON.parse(localStorage.getItem("products")) || [];
    products.splice(index, 1);
    localStorage.setItem("products", JSON.stringify(products));
    loadProducts();
    updateStats();
    alert('Product deleted successfully!');
  });
}

// ========================================
// INVENTORY SECTION
// ========================================

function openInventoryModal() {
  console.log("Opening inventory modal...");
  const modal = document.getElementById('inventoryModal');
  if (!modal) {
    console.error("ERROR: inventoryModal not found!");
    return;
  }
  modal.classList.add('show');
  // Clear form
  document.getElementById("ingredientName").value = "";
  document.getElementById("ingredientStock").value = "";
  document.getElementById("ingredientUnit").value = "pcs";
  document.getElementById("ingredientExpiry").value = "";
  console.log("Inventory modal opened successfully");
}

function closeInventoryModal() {
  console.log("Closing inventory modal...");
  const modal = document.getElementById('inventoryModal');
  if (modal) {
    modal.classList.remove('show');
    // Reset editing state
    delete modal.dataset.editingIndex;
    document.getElementById('inventoryModalTitle').textContent = 'Add Inventory Item';
    document.getElementById('inventorySubmitBtn').textContent = 'Add Item';
  }
}

function showConfirmModal(message, callback) {
  document.getElementById('confirmMessage').innerText = message;
  confirmCallback = callback;
  document.getElementById('confirmModal').classList.add('show');
}

function closeConfirmModal() {
  document.getElementById('confirmModal').classList.remove('show');
  confirmCallback = null;
}

function confirmDeleteAction() {
  if (confirmCallback) {
    confirmCallback();
  }
  closeConfirmModal();
}

function saveInventory() {
  const name = document.getElementById("ingredientName").value.trim();
  const stock = parseFloat(document.getElementById("ingredientStock").value);
  const unit = document.getElementById("ingredientUnit").value;
  const expiry = document.getElementById("ingredientExpiry").value;
  
  if (!name || !stock || !expiry) {
    alert('Please fill in all required fields!');
    return;
  }
  
  if (isNaN(stock) || stock < 0) {
    alert('Please enter a valid stock quantity!');
    return;
  }
  
  const inventory = JSON.parse(localStorage.getItem("inventory")) || [];
  const modal = document.getElementById('inventoryModal');
  const editingIndex = modal.dataset.editingIndex;
  
  if (editingIndex !== undefined && editingIndex !== null && editingIndex !== "") {
    // Update existing item
    inventory[editingIndex] = {
      ...inventory[editingIndex],
      ingredient: name,
      stock: stock,
      unit: unit,
      expiryDate: expiry
    };
    alert('Inventory item updated successfully!');
  } else {
    // Add new item
    inventory.push({
      id: Date.now(),
      ingredient: name,
      stock: stock,
      unit: unit,
      expiryDate: expiry,
      addedAt: new Date().toLocaleDateString()
    });
    alert('Inventory item added successfully!');
  }
  
  localStorage.setItem("inventory", JSON.stringify(inventory));
  closeInventoryModal();
  loadInventory();
  updateStats();
  checkExpiringItems();
}

function loadInventory() {
  const inventory = JSON.parse(localStorage.getItem("inventory")) || [];
  const tbody = document.getElementById("inventoryTableBody");
  tbody.innerHTML = "";
  
  if (inventory.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No inventory items yet</td></tr>';
    return;
  }
  
  inventory.forEach((item, index) => {
    const stock = parseFloat(item.stock) || 0;
    const expiryDate = new Date(item.expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    
    let statusClass = 'success';
    let statusText = 'In Stock';
    
    if (stock === 0) {
      statusClass = 'danger';
      statusText = 'Out of Stock';
    } else if (stock < 5) {
      statusClass = 'danger';
      statusText = 'Low Stock';
    } else if (stock < 20) {
      statusClass = 'warning';
      statusText = 'Medium Stock';
    }
    
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><strong>${item.ingredient}</strong></td>
      <td>${stock}</td>
      <td>${item.unit || 'pcs'}</td>
      <td>${expiryDate.toLocaleDateString()}</td>
      <td>${daysUntilExpiry > 0 ? daysUntilExpiry + ' days' : 'EXPIRED'}</td>
      <td><span class="admin-badge ${statusClass}">${statusText}</span></td>
      <td>
        <button class="btn-warning" onclick="editInventory(${index})" style="margin-right: 5px;">Edit</button>
        <button class="btn-danger" onclick="deleteInventory(${index})">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function editInventory(index) {
  const inventory = JSON.parse(localStorage.getItem("inventory")) || [];
  const item = inventory[index];
  
  // Populate the modal with existing data
  document.getElementById('ingredientName').value = item.ingredient;
  document.getElementById('ingredientStock').value = item.stock;
  document.getElementById('ingredientUnit').value = item.unit || 'pcs';
  document.getElementById('ingredientExpiry').value = item.expiryDate;
  
  // Set editing mode
  document.getElementById('inventoryModal').dataset.editingIndex = index;
  document.getElementById('inventoryModalTitle').textContent = 'Edit Inventory Item';
  document.getElementById('inventorySubmitBtn').textContent = 'Update Item';
  
  // Open modal
  document.getElementById('inventoryModal').classList.add('show');
}

function deleteInventory(index) {
  showConfirmModal('Are you sure you want to delete this inventory item?', () => {
    const inventory = JSON.parse(localStorage.getItem("inventory")) || [];
    inventory.splice(index, 1);
    localStorage.setItem("inventory", JSON.stringify(inventory));
    loadInventory();
    updateStats();
    alert('Inventory item deleted successfully!');
  });
}

// ========================================
// EXPIRING ITEMS SECTION
// ========================================

function loadExpiringItems() {
  const inventory = JSON.parse(localStorage.getItem("inventory")) || [];
  const tbody = document.getElementById("expiringTableBody");
  tbody.innerHTML = "";
  
  // Filter and sort expiring items
  const expiringItems = inventory.map(item => {
    const expiryDate = new Date(item.expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    return { ...item, daysUntilExpiry };
  }).filter(item => item.daysUntilExpiry <= 30 && item.daysUntilExpiry >= -1)
   .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  
  if (expiringItems.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="empty-state">All inventory items are safe - no expiring items</td></tr>';
    return;
  }
  
  expiringItems.forEach(item => {
    let priority = 'Low';
    let priorityClass = 'info';
    
    if (item.daysUntilExpiry <= 0) {
      priority = 'Critical - EXPIRED';
      priorityClass = 'danger';
    } else if (item.daysUntilExpiry <= 3) {
      priority = 'Critical';
      priorityClass = 'danger';
    } else if (item.daysUntilExpiry <= 7) {
      priority = 'High';
      priorityClass = 'warning';
    } else if (item.daysUntilExpiry <= 14) {
      priority = 'Medium';
      priorityClass = 'warning';
    }
    
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><strong>${item.ingredient}</strong></td>
      <td>${new Date(item.expiryDate).toLocaleDateString()}</td>
      <td>${item.daysUntilExpiry > 0 ? item.daysUntilExpiry + ' days' : 'EXPIRED'}</td>
      <td><span class="admin-badge ${priorityClass}">${priority}</span></td>
    `;
    tbody.appendChild(row);
  });
}

function checkExpiringItems() {
  const inventory = JSON.parse(localStorage.getItem("inventory")) || [];
  const alertBox = document.getElementById("expiringAlert");
  
  const criticalItems = inventory.filter(item => {
    const expiryDate = new Date(item.expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry >= -1;
  });
  
  if (criticalItems.length > 0) {
    let message = `<strong>⚠️ WARNING: ${criticalItems.length} inventory item(s) expiring soon!</strong><br>`;
    criticalItems.forEach(item => {
      const expiryDate = new Date(item.expiryDate);
      const today = new Date();
      const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
      if (daysUntilExpiry <= 0) {
        message += `🔴 <strong>${item.ingredient}</strong> - EXPIRED<br>`;
      } else {
        message += `🟡 <strong>${item.ingredient}</strong> - Expires in ${daysUntilExpiry} days<br>`;
      }
    });
    alertBox.innerHTML = message;
    alertBox.classList.add('show');
  } else {
    alertBox.classList.remove('show');
  }
}

// ========================================
// SALES REPORT SECTION
// ========================================

function loadSalesReport() {
  const sales = JSON.parse(localStorage.getItem("sales")) || [];
  const dailySales = JSON.parse(localStorage.getItem("dailySales")) || {};
  
  if (sales.length === 0) {
    document.getElementById("todaysSales").innerText = "₱0";
    document.getElementById("totalRevenueSales").innerText = "₱0";
    document.getElementById("ordersCompleted").innerText = "0";
    document.getElementById("bestSeller").innerText = "-";
    document.getElementById("topProductsTableBody").innerHTML = '<tr><td colspan="4" class="empty-state">No sales data yet</td></tr>';
    document.getElementById("dailySalesTableBody").innerHTML = '<tr><td colspan="4" class="empty-state">No sales history yet</td></tr>';
    return;
  }
  
  // Calculate today's sales
  const today = new Date().toDateString();
  const todaySalesAmount = dailySales[today] || 0;
  
  // Calculate total revenue
  let totalRevenue = 0;
  sales.forEach(s => totalRevenue += s.totalSales);
  
  // Calculate top products
  const productSales = {};
  sales.forEach(sale => {
    sale.items.forEach(item => {
      if (!productSales[item.name]) {
        productSales[item.name] = { qty: 0, revenue: 0 };
      }
      productSales[item.name].qty += item.qty;
      productSales[item.name].revenue += item.price * item.qty;
    });
  });
  
  const sortedProducts = Object.entries(productSales)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue);
  
  // Update stats
  document.getElementById("todaysSales").innerText = `₱${todaySalesAmount.toFixed(2)}`;
  document.getElementById("totalRevenueSales").innerText = `₱${totalRevenue.toFixed(2)}`;
  document.getElementById("ordersCompleted").innerText = sales.length;
  document.getElementById("bestSeller").innerText = sortedProducts.length > 0 ? sortedProducts[0].name : "-";
  
  // Display top products
  const topProductsBody = document.getElementById("topProductsTableBody");
  topProductsBody.innerHTML = "";
  
  if (sortedProducts.length === 0) {
    topProductsBody.innerHTML = '<tr><td colspan="4" class="empty-state">No sales data yet</td></tr>';
  } else {
    sortedProducts.slice(0, 10).forEach(product => {
      const percentage = ((product.revenue / totalRevenue) * 100).toFixed(1);
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><strong>${product.name}</strong></td>
        <td>${product.qty}</td>
        <td>₱${product.revenue.toFixed(2)}</td>
        <td>${percentage}%</td>
      `;
      topProductsBody.appendChild(row);
    });
  }
  
  // Display daily sales breakdown
  const dailySalesBody = document.getElementById("dailySalesTableBody");
  dailySalesBody.innerHTML = "";
  
  const dateOrder = Object.keys(dailySales).sort().reverse();
  if (dateOrder.length === 0) {
    dailySalesBody.innerHTML = '<tr><td colspan="4" class="empty-state">No sales history yet</td></tr>';
  } else {
    dateOrder.slice(0, 30).forEach(date => {
      const amount = dailySales[date];
      const dayOrders = sales.filter(s => new Date(s.date).toDateString() === date).length;
      const avgOrderValue = dayOrders > 0 ? (amount / dayOrders).toFixed(2) : 0;
      
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${date}</td>
        <td>${dayOrders}</td>
        <td>₱${amount.toFixed(2)}</td>
        <td>₱${avgOrderValue}</td>
      `;
      dailySalesBody.appendChild(row);
    });
  }

  // Generate chart
  generateSalesChart(dailySales);
}

function exportSalesReport() {
  const sales = JSON.parse(localStorage.getItem("sales")) || [];
  const dailySales = JSON.parse(localStorage.getItem("dailySales")) || {};
  
  let reportText = "EXPLOSIVE BURGER - SALES REPORT\n";
  reportText += "================================\n";
  reportText += `Generated: ${new Date().toLocaleString()}\n\n`;
  reportText += `Total Orders: ${sales.length}\n`;
  
  let totalRevenue = 0;
  sales.forEach(s => totalRevenue += s.totalSales);
  reportText += `Total Revenue: ₱${totalRevenue.toFixed(2)}\n\n`;
  
  reportText += "DAILY SALES:\n";
  Object.entries(dailySales)
    .sort()
    .reverse()
    .slice(0, 30)
    .forEach(([date, amount]) => {
      reportText += `${date}: ₱${amount.toFixed(2)}\n`;
    });
  
  const element = document.createElement("a");
  element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(reportText));
  element.setAttribute("download", `sales-report-${Date.now()}.txt`);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
  alert("Sales report exported successfully!");
}

function generateSalesChart(dailySales) {
  const ctx = document.getElementById('salesChart').getContext('2d');
  
  const dates = Object.keys(dailySales).sort().slice(-7); // Last 7 days
  const salesData = dates.map(date => dailySales[date]);
  const labels = dates.map(date => new Date(date).toLocaleDateString());
  
  if (window.salesChartInstance) {
    window.salesChartInstance.destroy();
  }
  
  window.salesChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Daily Sales (₱)',
        data: salesData,
        borderColor: '#ff4757',
        backgroundColor: 'rgba(255, 71, 87, 0.2)',
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}
