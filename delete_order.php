<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/db.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    sendJSON(['error' => 'Unauthorized'], 401);
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['order_id'])) {
    sendJSON(['error' => 'Missing order_id'], 400);
}

$order_id = $conn->real_escape_string($data['order_id']);

$conn->begin_transaction();

try {
    // Delete order items
    if (!$conn->query("DELETE FROM order_items WHERE order_id = '$order_id'")) {
        throw new Exception("Failed to delete order items: " . $conn->error);
    }

    // Delete sales log
    if (!$conn->query("DELETE FROM sales_log WHERE order_id = '$order_id'")) {
        throw new Exception("Failed to delete sales log: " . $conn->error);
    }

    // Delete order
    if (!$conn->query("DELETE FROM orders WHERE id = '$order_id'")) {
        throw new Exception("Failed to delete order: " . $conn->error);
    }

    $conn->commit();
    sendJSON(['success' => true, 'message' => 'Order deleted successfully']);

} catch (Exception $e) {
    $conn->rollback();
    sendJSON(['error' => $e->getMessage()], 500);
}
?>