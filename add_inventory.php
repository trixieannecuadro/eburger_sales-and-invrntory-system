<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/db.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    sendJSON(['error' => 'Unauthorized'], 401);
}

$data = json_decode(file_get_contents("php://input"), true);

$required = ['ingredient_name', 'current_stock', 'expiry_date'];
foreach ($required as $field) {
    if (!isset($data[$field])) {
        sendJSON(['error' => "Missing field: $field"], 400);
    }
}

$ingredient_name = $conn->real_escape_string($data['ingredient_name']);
$current_stock = (float)$data['current_stock'];
$unit = isset($data['unit']) ? $conn->real_escape_string($data['unit']) : 'pcs';
$min_stock = isset($data['min_stock_level']) ? (float)$data['min_stock_level'] : 5;
$expiry_date = $data['expiry_date'];

$query = "INSERT INTO inventory (ingredient_name, current_stock, unit, min_stock_level, expiry_date) 
          VALUES ('$ingredient_name', $current_stock, '$unit', $min_stock, '$expiry_date')";

if ($conn->query($query)) {
    // Log inventory change
    $log_query = "INSERT INTO inventory_log (ingredient_name, change_amount, new_stock, action_type, reason) 
                  VALUES ('$ingredient_name', $current_stock, $current_stock, 'add', 'Initial stock added')";
    $conn->query($log_query);

    sendJSON(['success' => true, 'message' => 'Inventory item added successfully', 'id' => $conn->insert_id]);
} else {
    sendJSON(['error' => 'Failed to add inventory: ' . $conn->error], 500);
}
?>