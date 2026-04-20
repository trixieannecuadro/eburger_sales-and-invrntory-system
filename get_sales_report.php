<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/db.php';

$start_date = isset($_GET['start_date']) ? $_GET['start_date'] : date('Y-m-d', strtotime('-30 days'));
$end_date = isset($_GET['end_date']) ? $_GET['end_date'] : date('Y-m-d');

// Get total sales
$total_query = "SELECT COUNT(DISTINCT order_id) as total_orders, SUM(sale_amount) as total_revenue 
                FROM sales_log WHERE DATE(sale_date) BETWEEN '$start_date' AND '$end_date'";
$total_result = $conn->query($total_query);
$totals = $total_result->fetch_assoc();

// Get top products
$products_query = "SELECT product_name, SUM(quantity) as units_sold, SUM(sale_amount) as revenue 
                   FROM sales_log WHERE DATE(sale_date) BETWEEN '$start_date' AND '$end_date'
                   GROUP BY product_name ORDER BY revenue DESC LIMIT 10";
$products_result = $conn->query($products_query);
$top_products = [];
while ($row = $products_result->fetch_assoc()) {
    $top_products[] = $row;
}

// Get daily breakdown
$daily_query = "SELECT DATE(sale_date) as sale_date, COUNT(DISTINCT order_id) as orders, SUM(sale_amount) as revenue 
                FROM sales_log WHERE DATE(sale_date) BETWEEN '$start_date' AND '$end_date'
                GROUP BY DATE(sale_date) ORDER BY sale_date DESC";
$daily_result = $conn->query($daily_query);
$daily_breakdown = [];
while ($row = $daily_result->fetch_assoc()) {
    $row['avg_order_value'] = $row['orders'] > 0 ? round($row['revenue'] / $row['orders'], 2) : 0;
    $daily_breakdown[] = $row;
}

sendJSON([
    'success' => true,
    'period' => ['start' => $start_date, 'end' => $end_date],
    'totals' => $totals,
    'top_products' => $top_products,
    'daily_breakdown' => $daily_breakdown
]);
?>