<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/db.php';

$status = isset($_GET['status']) ? $_GET['status'] : null;

$query = "SELECT * FROM orders";

if ($status) {
    $status = $conn->real_escape_string($status);
    $query .= " WHERE status = '$status'";
}

$query .= " ORDER BY order_date DESC";

$result = $conn->query($query);

if (!$result) {
    sendJSON(['error' => $conn->error], 500);
}

$orders = [];
while ($row = $result->fetch_assoc()) {
    // Get order items
    $items_result = $conn->query("SELECT * FROM order_items WHERE order_id = '" . $row['id'] . "'");
    $items = [];
    while ($item = $items_result->fetch_assoc()) {
        $items[] = $item;
    }
    $row['items'] = $items;
    $orders[] = $row;
}

sendJSON(['success' => true, 'orders' => $orders]);
?>