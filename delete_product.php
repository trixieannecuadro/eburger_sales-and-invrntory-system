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

if (!isset($data['id'])) {
    sendJSON(['error' => 'Missing product ID'], 400);
}

$id = (int)$data['id'];
$updates = [];

if (isset($data['name'])) $updates[] = "name = '" . $conn->real_escape_string($data['name']) . "'";
if (isset($data['price'])) $updates[] = "price = " . (float)$data['price'];
if (isset($data['stock_quantity'])) $updates[] = "stock_quantity = " . (int)$data['stock_quantity'];
if (isset($data['category'])) $updates[] = "category = '" . $conn->real_escape_string($data['category']) . "'";
if (isset($data['expiry_date'])) $updates[] = "expiry_date = '" . $data['expiry_date'] . "'";

if (empty($updates)) {
    sendJSON(['error' => 'No fields to update'], 400);
}

$query = "UPDATE products SET " . implode(', ', $updates) . " WHERE id = $id";

if ($conn->query($query)) {
    sendJSON(['success' => true, 'message' => 'Product updated successfully']);
} else {
    sendJSON(['error' => 'Failed to update product: ' . $conn->error], 500);
}
?>