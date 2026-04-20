<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/db.php';

$category = isset($_GET['category']) ? $_GET['category'] : null;

$query = "SELECT * FROM products WHERE status != 'expired'";

if ($category) {
    $category = $conn->real_escape_string($category);
    $query .= " AND category = '$category'";
}

$query .= " ORDER BY name ASC";

$result = $conn->query($query);

if (!$result) {
    sendJSON(['error' => $conn->error], 500);
}

$products = [];
while ($row = $result->fetch_assoc()) {
    $products[] = $row;
}

sendJSON(['success' => true, 'products' => $products]);
?>