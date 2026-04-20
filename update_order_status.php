<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/db.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    sendJSON(['error' => 'Unauthorized'], 401);
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['order_id']) || !isset($data['status'])) {
    sendJSON(['error' => 'Missing order_id or status'], 400);
}

$order_id = $conn->real_escape_string($data['order_id']);
$status = $conn->real_escape_string($data['status']);

$query = "UPDATE orders SET status = '$status' WHERE id = '$order_id'";

if ($conn->query($query)) {
    sendJSON(['success' => true, 'message' => 'Order status updated successfully']);
} else {
    sendJSON(['error' => 'Failed to update order: ' . $conn->error], 500);
}
?>