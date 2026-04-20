<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/db.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    sendJSON(['error' => 'Unauthorized'], 401);
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['id'])) {
    sendJSON(['error' => 'Missing inventory ID'], 400);
}

$id = (int)$data['id'];

// Get ingredient name before deleting (for logging)
$result = $conn->query("SELECT ingredient_name, current_stock FROM inventory WHERE id = $id");
if ($result->num_rows === 0) {
    sendJSON(['error' => 'Inventory item not found'], 404);
}

$row = $result->fetch_assoc();
$ingredient_name = $row['ingredient_name'];
$stock_amount = $row['current_stock'];

// Delete from inventory
$query = "DELETE FROM inventory WHERE id = $id";

if ($conn->query($query)) {
    // Log the deletion
    $log_query = "INSERT INTO inventory_log (ingredient_name, change_amount, new_stock, action_type, reason) 
                  VALUES ('$ingredient_name', -$stock_amount, 0, 'deduct', 'Inventory item deleted')";
    $conn->query($log_query);

    sendJSON(['success' => true, 'message' => 'Inventory item deleted successfully']);
} else {
    sendJSON(['error' => 'Failed to delete inventory: ' . $conn->error], 500);
}
?>