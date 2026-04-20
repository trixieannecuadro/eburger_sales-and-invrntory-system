<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJSON(['error' => 'Invalid request method'], 400);
}

$data = json_decode(file_get_contents("php://input"), true);

// Validate required fields
$required = ['customer_name', 'customer_contact', 'payment_method', 'items', 'total_amount'];
foreach ($required as $field) {
    if (!isset($data[$field])) {
        sendJSON(['error' => "Missing field: $field"], 400);
    }
}

// Create shorter order ID
$order_id = "ORD-" . date('YmdHi') . rand(100, 999);

$customer_name = $conn->real_escape_string($data['customer_name']);
$customer_address = isset($data['customer_address']) ? $conn->real_escape_string($data['customer_address']) : '';
$customer_contact = $conn->real_escape_string($data['customer_contact']);
$payment_method = $conn->real_escape_string($data['payment_method']);
$total_amount = (float)$data['total_amount'];
$items = $data['items'];

// Start transaction
$conn->begin_transaction();

try {
    // Insert order
    $query = "INSERT INTO orders (id, customer_name, customer_address, customer_contact, payment_method, total_amount, status) 
              VALUES ('$order_id', '$customer_name', '$customer_address', '$customer_contact', '$payment_method', $total_amount, 'pending')";
    
    if (!$conn->query($query)) {
        throw new Exception("Failed to create order: " . $conn->error);
    }

    // Insert order items
    foreach ($items as $item) {
        $product_name = $conn->real_escape_string($item['name']);
        $quantity = (int)$item['qty'];
        $unit_price = (float)$item['price'];
        $total_price = $quantity * $unit_price;

        $item_query = "INSERT INTO order_items (order_id, product_name, quantity, unit_price, total_price) 
                       VALUES ('$order_id', '$product_name', $quantity, $unit_price, $total_price)";
        
        if (!$conn->query($item_query)) {
            throw new Exception("Failed to add order item: " . $conn->error);
        }

        // Deduct product stock
        $stock_query = "UPDATE products SET stock_quantity = stock_quantity - $quantity WHERE name = '$product_name'";
        if (!$conn->query($stock_query)) {
            throw new Exception("Failed to update stock: " . $conn->error);
        }

        // Record in sales log
        $sales_query = "INSERT INTO sales_log (order_id, product_name, quantity, sale_amount) 
                        VALUES ('$order_id', '$product_name', $quantity, $total_price)";
        if (!$conn->query($sales_query)) {
            throw new Exception("Failed to log sale: " . $conn->error);
        }
    }

    $conn->commit();
    sendJSON(['success' => true, 'message' => 'Order created successfully', 'order_id' => $order_id]);

} catch (Exception $e) {
    $conn->rollback();
    sendJSON(['error' => $e->getMessage()], 500);
}
?>