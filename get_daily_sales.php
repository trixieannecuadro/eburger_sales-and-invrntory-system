<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/db.php';

$query = "SELECT DATE(sale_date) as date, SUM(sale_amount) as amount 
          FROM sales_log 
          GROUP BY DATE(sale_date)
          ORDER BY date DESC 
          LIMIT 30";

$result = $conn->query($query);

if (!$result) {
    sendJSON(['error' => $conn->error], 500);
}

$daily_sales = [];
while ($row = $result->fetch_assoc()) {
    $daily_sales[] = $row;
}

sendJSON(['success' => true, 'daily_sales' => array_reverse($daily_sales)]);
?>