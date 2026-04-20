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
$updates = [];

if (isset($data['current_stock'])) $updates[] = "current_stock = " . (float)$data['current_stock'];
if (isset($data['unit'])) $updates[] = "unit = '" . $conn->real_escape_string($data['unit']) . "'";
if (isset($data['expiry_date'])) $updates[] = "expiry_date = '" . $data['expiry_date'] . "'";

if (empty($updates)) {
    sendJSON(['error' => 'No fields to update'], 400);
}

$query = "UPDATE inventory SET " . implode(', ', $updates) . " WHERE id = $id";

if ($conn->query($query)) {
    sendJSON(['success' => true, 'message' => 'Inventory updated successfully']);
} else {
    sendJSON(['error' => 'Failed to update inventory: ' . $conn->error], 500);
}
?>