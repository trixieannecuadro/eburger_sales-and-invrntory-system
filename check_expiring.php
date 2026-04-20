<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/db.php';

$days_threshold = isset($_GET['days']) ? (int)$_GET['days'] : 7;

$query = "SELECT *, 
          DATEDIFF(expiry_date, CURDATE()) as days_until_expiry
          FROM inventory 
          WHERE expiry_date IS NOT NULL 
          AND DATEDIFF(expiry_date, CURDATE()) <= $days_threshold 
          AND DATEDIFF(expiry_date, CURDATE()) >= -1
          ORDER BY expiry_date ASC";

$result = $conn->query($query);

if (!$result) {
    sendJSON(['error' => $conn->error], 500);
}

$expiring = [];
while ($row = $result->fetch_assoc()) {
    $days = (int)$row['days_until_expiry'];
    
    if ($days <= 0) {
        $row['priority'] = 'CRITICAL - EXPIRED';
    } elseif ($days <= 3) {
        $row['priority'] = 'CRITICAL';
    } elseif ($days <= 7) {
        $row['priority'] = 'HIGH';
    } else {
        $row['priority'] = 'MEDIUM';
    }
    
    $expiring[] = $row;
}

sendJSON(['success' => true, 'expiring_items' => $expiring, 'count' => count($expiring)]);
?>