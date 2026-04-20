<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/db.php';

$query = "SELECT * FROM inventory ORDER BY ingredient_name ASC";
$result = $conn->query($query);

if (!$result) {
    sendJSON(['error' => $conn->error], 500);
}

$inventory = [];
while ($row = $result->fetch_assoc()) {
    $row['days_until_expiry'] = $row['expiry_date'] ? ceil((strtotime($row['expiry_date']) - time()) / (60 * 60 * 24)) : null;
    $inventory[] = $row;
}

sendJSON(['success' => true, 'inventory' => $inventory]);
?>