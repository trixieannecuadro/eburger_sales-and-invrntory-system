<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/db.php';

// Test WITHOUT session (for testing only)
$data = [
    'id' => 6,  // Buns (check your inventory table for correct ID)
    'current_stock' => 250
];

$id = (int)$data['id'];
$stock = (float)$data['current_stock'];

$query = "UPDATE inventory SET current_stock = $stock WHERE id = $id";

if ($conn->query($query)) {
    echo json_encode(['success' => true, 'message' => 'Inventory updated', 'stock' => $stock]);
} else {
    echo json_encode(['error' => $conn->error]);
}

// Show current inventory
$result = $conn->query("SELECT * FROM inventory");
echo "<br>CURRENT INVENTORY:<br>";
while ($row = $result->fetch_assoc()) {
    echo $row['ingredient_name'] . ": " . $row['current_stock'] . "<br>";
}
?>