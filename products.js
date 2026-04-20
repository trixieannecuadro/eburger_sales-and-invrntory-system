// Initialize products with expiration date support
const defaultProducts = [
  {id: 1, name:"Cheese Burger", price:120, img:"c-burger.jpg", expiryDate: getDefaultExpiryDate(30)},
  {id: 2, name:"Isarog Burger", price:130, img:"isarog_burger.jpg", expiryDate: getDefaultExpiryDate(30)},
  {id: 3, name:"Kanlaon Burger", price:140, img:"kanlaon_burger.jpg", expiryDate: getDefaultExpiryDate(30)},
  {id: 4, name:"Pinatubo Burger", price:135, img:"pinatubo_burger.jpg", expiryDate: getDefaultExpiryDate(30)},
  {id: 5, name:"Mayon Burger", price:145, img:"mayon_burger.jpg", expiryDate: getDefaultExpiryDate(30)},
  {id: 6, name:"Buffalo Wings", price:100, img:"buffalo_wings.jpg", expiryDate: getDefaultExpiryDate(7)},
  {id: 7, name:"BBQ Wings", price:110, img:"bbq_wings.jpg", expiryDate: getDefaultExpiryDate(7)},
  {id: 8, name:"Spicy Wings", price:190, img:"spicy-wings.jpg", expiryDate: getDefaultExpiryDate(7)},
  {id: 9, name:"Garlic Wings", price:175, img:"garlic_wings.jpg", expiryDate: getDefaultExpiryDate(7)},
  {id: 10, name:"Coke", price:50, img:"coke.jpg", expiryDate: getDefaultExpiryDate(90)},
  {id: 11, name:"Sprite", price:50, img:"sprite.jpg", expiryDate: getDefaultExpiryDate(90)},
  {id: 12, name:"Pepsi", price:50, img:"pepsi.jpg", expiryDate: getDefaultExpiryDate(90)},
  {id: 13, name:"Water", price:30, img:"water.jpg", expiryDate: getDefaultExpiryDate(365)},
  {id: 14, name:"Lemonade", price:60, img:"lemonade.jpg", expiryDate: getDefaultExpiryDate(30)},
  {id: 15, name:"Fries", price:60, img:"fries.jpg", expiryDate: getDefaultExpiryDate(3)}
];

function getDefaultExpiryDate(daysFromNow) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}

const products = defaultProducts;

function loadMenu(){
  document.getElementById("burgersContainer").innerHTML = "";
  document.getElementById("wingsContainer").innerHTML = "";
  document.getElementById("drinksContainer").innerHTML = "";
  document.getElementById("sidesContainer").innerHTML = "";

  products.forEach(p => {
    const expiryDate = new Date(p.expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

    let expiryStatus = '';
    if (daysUntilExpiry <= 0) {
      expiryStatus = '<span style="color:red;font-weight:bold;">EXPIRED</span>';
    } else if (daysUntilExpiry <= 3) {
      expiryStatus = `<span style="color:red;">Expires in ${daysUntilExpiry} day(s)</span>`;
    } else if (daysUntilExpiry <= 7) {
      expiryStatus = `<span style="color:orange;">Expires in ${daysUntilExpiry} days</span>`;
    }

    const productHTML = `
      <div class="card">
        <img src="menu_pics/${p.img}">
        <h3>${p.name}</h3>
        <p>₱${p.price}</p>
        ${expiryStatus}
        <button onclick="addToCart('${p.name}',${p.price})">Add to Cart</button>
      </div>
    `;

    if (p.name.includes("Burger")) {
      document.getElementById("burgersContainer").innerHTML += productHTML;
    } else if (p.name.includes("Wings")) {
      document.getElementById("wingsContainer").innerHTML += productHTML;
    } else if (p.name === "Fries") {
      document.getElementById("sidesContainer").innerHTML += productHTML;
    } else {
      document.getElementById("drinksContainer").innerHTML += productHTML;
    }
  });
}

// Auto load menu
if (document.getElementById("burgersContainer")) {
  loadMenu();
}

// ADMIN PRODUCTS
let adminProducts = JSON.parse(localStorage.getItem("products"));
if (!adminProducts || adminProducts.length === 0) {
  adminProducts = [
    {id: 1, name:"Cheese Burger", price:120, img:"c-burger.jpg", expiryDate: getDefaultExpiryDate(30)},
    {id: 2, name:"Buffalo Wings", price:100, img:"buffalo_wings.jpg", expiryDate: getDefaultExpiryDate(7)},
    {id: 3, name:"Coke", price:50, img:"coke.jpg", expiryDate: getDefaultExpiryDate(90)}
  ];
  localStorage.setItem("products", JSON.stringify(adminProducts));
}

let editingIndex = -1;

// ADD / UPDATE PRODUCT
function addProduct(){
  let name = document.getElementById("productName").value;
  let price = document.getElementById("productPrice").value;
  let expiry = document.getElementById("productExpiry").value || getDefaultExpiryDate(30);

  if (!name || !price) {
    alert("Please fill in all required fields");
    return;
  }

  if (editingIndex === -1) {
    adminProducts.push({
      id: Date.now(),
      name: name,
      price: parseFloat(price),
      img: "images/burger1.jpg",
      expiryDate: expiry
    });
  } else {
    adminProducts[editingIndex].name = name;
    adminProducts[editingIndex].price = parseFloat(price);
    adminProducts[editingIndex].expiryDate = expiry;
    editingIndex = -1;
    document.getElementById("addProductBtn").textContent = "Add Product";
  }

  localStorage.setItem("products", JSON.stringify(adminProducts));
  displayProducts();
  clearProductForm();
}

// DISPLAY PRODUCTS (FIXED)
function displayProducts(){
  let table = document.getElementById("productTable");
  if (!table) return;

  table.innerHTML = "";

  adminProducts.forEach((p, i) => {
    const expiryDate = new Date(p.expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

    let statusClass = "success";
    let statusText = "Safe";

    if (daysUntilExpiry <= 0) {
      statusClass = "danger";
      statusText = "EXPIRED";
    } else if (daysUntilExpiry <= 7) {
      statusClass = "danger";
      statusText = "Expiring Soon";
    } else if (daysUntilExpiry <= 30) {
      statusClass = "warning";
      statusText = "Monitor";
    }

    table.innerHTML += `
      <tr>
        <td>${p.name}</td>
        <td>₱${Number(p.price).toFixed(2)}</td>
        <td>${expiryDate.toLocaleDateString()}</td>
        <td>${daysUntilExpiry > 0 ? daysUntilExpiry + " days" : "EXPIRED"}</td>
        <td><span class="admin-badge ${statusClass}">${statusText}</span></td>
        <td>
          <button class="btn-warning" onclick="editProduct(${i})">Edit</button>
          <button class="btn-danger" onclick="deleteProduct(${i})">Delete</button>
        </td>
      </tr>
    `;
  });
}

// EDIT PRODUCT
function editProduct(i){
  const product = adminProducts[i];
  document.getElementById("productName").value = product.name;
  document.getElementById("productPrice").value = product.price;
  document.getElementById("productExpiry").value = product.expiryDate;
  editingIndex = i;
  document.getElementById("addProductBtn").textContent = "Update Product";
}

// CLEAR FORM
function clearProductForm(){
  document.getElementById("productName").value = "";
  document.getElementById("productPrice").value = "";
  document.getElementById("productExpiry").value = getDefaultExpiryDate(30);
  editingIndex = -1;
  document.getElementById("addProductBtn").textContent = "Add Product";
}

// AUTO LOAD ADMIN TABLE
if (document.getElementById("productTable")) {
  displayProducts();
}