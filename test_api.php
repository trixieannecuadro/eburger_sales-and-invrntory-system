<?php
header('Content-Type: application/json');

// Test if database connection works
require_once __DIR__ . '/config/db.php';

// Test 1: Check if products table has data
$products = $conn->query("SELECT COUNT(*) as count FROM products");
$product_count = $products->fetch_assoc()['count'];

// Test 2: Check orders table
$orders = $conn->query("SELECT COUNT(*) as count FROM orders");
$order_count = $orders->fetch_assoc()['count'];

// Test 3: Check order_items table
$order_items = $conn->query("SELECT COUNT(*) as count FROM order_items");
$order_items_count = $order_items->fetch_assoc()['count'];

// Test 4: Check sales_log table
$sales = $conn->query("SELECT COUNT(*) as count FROM sales_log");
$sales_count = $sales->fetch_assoc()['count'];

echo json_encode([
    'database_connected' => true,
    'products_count' => $product_count,
    'orders_count' => $order_count,
    'order_items_count' => $order_items_count,
    'sales_log_count' => $sales_count,
    'status' => 'All tables accessible ✅'
]);
?>