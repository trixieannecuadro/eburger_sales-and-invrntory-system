<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/db.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    sendJSON(['error' => 'Unauthorized'], 401);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJSON(['error' => 'Invalid request method'], 400);
}

$data = json_decode(file_get_contents("php://input"), true);

$required = ['name', 'price', 'category', 'stock_quantity'];
foreach ($required as $field) {
    if (!isset($data[$field])) {
        sendJSON(['error' => "Missing field: $field"], 400);
    }
}

$name = $conn->real_escape_string($data['name']);
$description = isset($data['description']) ? $conn->real_escape_string($data['description']) : '';
$price = (float)$data['price'];
$category = $conn->real_escape_string($data['category']);
$image = isset($data['image']) ? $conn->real_escape_string($data['image']) : null;
$stock = (int)$data['stock_quantity'];
$min_stock = isset($data['min_stock_level']) ? (int)$data['min_stock_level'] : 10;
$expiry = isset($data['expiry_date']) ? $data['expiry_date'] : null;

$query = "INSERT INTO products (name, description, price, category, image, stock_quantity, min_stock_level, expiry_date, status) 
          VALUES ('$name', '$description', $price, '$category', '$image', $stock, $min_stock, '$expiry', 'active')";

if ($conn->query($query)) {
    sendJSON(['success' => true, 'message' => 'Product added successfully', 'id' => $conn->insert_id]);
} else {
    sendJSON(['error' => 'Failed to add product: ' . $conn->error], 500);
}
?>