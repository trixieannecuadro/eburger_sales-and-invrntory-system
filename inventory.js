// Inventory Management System

const defaultInventory = [
  {id: 1, ingredient: "Beef Patties", stock: 50, unit: "pcs", addedAt: new Date().toLocaleDateString(), lastUpdated: new Date().toLocaleDateString()},
  {id: 2, ingredient: "Chicken Wings", stock: 30, unit: "kg", addedAt: new Date().toLocaleDateString(), lastUpdated: new Date().toLocaleDateString()},
  {id: 3, ingredient: "Coca Cola", stock: 100, unit: "pcs", addedAt: new Date().toLocaleDateString(), lastUpdated: new Date().toLocaleDateString()}
];

let inventory = loadInventoryData();
let editingInventoryIndex = -1;

function loadInventoryData() {
  const stored = localStorage.getItem("inventory");
  if (!stored) {
    localStorage.setItem("inventory", JSON.stringify(defaultInventory));
    return [...defaultInventory];
  }

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function saveInventoryData(data) {
  inventory = Array.isArray(data) ? data : [];
  localStorage.setItem("inventory", JSON.stringify(inventory));
}

function syncInventory() {
  inventory = loadInventoryData();
  displayInventory();
}

function addInventory(){
  inventory = loadInventoryData();

  let ingredient = document.getElementById("ingredient")?.value;
  let stock = document.getElementById("stock")?.value;
  let unit = document.getElementById("unit")?.value || "pcs";
  
  if (!ingredient || !stock) {
    alert('Please fill in all required fields');
    return;
  }
  
  if (isNaN(stock) || stock < 0) {
    alert('Please enter a valid stock quantity');
    return;
  }
  
  if (editingInventoryIndex === -1) {
    // Add new item
    inventory.push({
      id: Date.now(),
      ingredient: ingredient,
      stock: parseFloat(stock),
      unit: unit,
      addedAt: new Date().toLocaleDateString(),
      lastUpdated: new Date().toLocaleDateString()
    });
  } else {
    const item = inventory[editingInventoryIndex];
    if (!item) {
      alert('Unable to update item. Please refresh the page and try again.');
      return;
    }
    item.ingredient = ingredient;
    item.stock = parseFloat(stock);
    item.unit = unit;
    item.lastUpdated = new Date().toLocaleDateString();
    editingInventoryIndex = -1;
    document.getElementById("addInventoryBtn").textContent = "Add";
  }
  
  saveInventoryData(inventory);
  displayInventory();
  clearInventoryForm();
  alert('Inventory item added successfully!');
}

function displayInventory(){
  inventory = loadInventoryData();
  let table = document.getElementById("inventoryTable");
  if (!table) return;
  
  table.innerHTML = "";
  
  if (inventory.length === 0) {
    table.innerHTML = '<tr><td colspan="5">No inventory items</td></tr>';
    return;
  }
  
  inventory.forEach((item, index) => {
    const stock = parseFloat(item.stock) || 0;
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
    
    table.innerHTML += `
      <tr>
        <td><strong>${item.ingredient}</strong></td>
        <td>${stock} ${item.unit || 'pcs'}</td>
        <td>${item.unit || 'pcs'}</td>
        <td><span class="admin-badge ${statusClass}">${statusText}</span></td>
        <td>
          <button class="btn-warning" onclick="editInventoryItem(${index})" style="margin-right: 5px;">Edit</button>
          <button class="btn-danger" onclick="deleteInventoryItem(${index})">Delete</button>
        </td>
      </tr>`;
  });
}

function editInventoryItem(index) {
  inventory = loadInventoryData();
  const item = inventory[index];
  if (!item) return;
  document.getElementById("ingredient").value = item.ingredient;
  document.getElementById("stock").value = item.stock;
  document.getElementById("unit").value = item.unit || "pcs";
  editingInventoryIndex = index;
  document.getElementById("addInventoryBtn").textContent = "Update";
}

function deleteInventoryItem(index) {
  inventory = loadInventoryData();
  if (!inventory[index]) return;
  if (confirm('Are you sure you want to delete this item?')) {
    inventory.splice(index, 1);
    saveInventoryData(inventory);
    displayInventory();
    alert('Item deleted successfully!');
  }
}

function clearInventoryForm() {
  const ingredientInput = document.getElementById("ingredient");
  const stockInput = document.getElementById("stock");
  const unitSelect = document.getElementById("unit");
  
  if (ingredientInput) ingredientInput.value = "";
  if (stockInput) stockInput.value = "";
  if (unitSelect) unitSelect.value = "pcs";
  editingInventoryIndex = -1;
  document.getElementById("addInventoryBtn").textContent = "Add";
}

function getLowStockItems() {
  return inventory.filter(i => parseFloat(i.stock) < 5);
}

function getInventoryStats() {
  return {
    totalItems: inventory.length,
    lowStockCount: getLowStockItems().length,
    outOfStockCount: inventory.filter(i => parseFloat(i.stock) === 0).length,
    totalValue: inventory.reduce((sum, i) => sum + (parseFloat(i.stock) || 0), 0)
  };
}

// Display inventory on page load if table exists
if (document.getElementById("inventoryTable")) {
  displayInventory();
}