<?php
header('Content-Type: application/json');

// Test data
$testData = array(
    'customer_name' => 'Test Customer',
    'customer_address' => 'Test Address',
    'customer_contact' => '09123456789',
    'payment_method' => 'cod',
    'items' => array(
        array('name' => 'Banahaw Burger', 'qty' => 1, 'price' => 120)
    ),
    'total_amount' => 120
);

// Call the API
require_once __DIR__ . '/config/db.php';

$data = $testData;

// CREATE SHORTER ORDER ID
$order_id = "ORD-" . date('YmdHi') . rand(100, 999);

$customer_name = $conn->real_escape_string($data['customer_name']);
$customer_address = isset($data['customer_address']) ? $conn->real_escape_string($data['customer_address']) : '';
$customer_contact = $conn->real_escape_string($data['customer_contact']);
$payment_method = $conn->real_escape_string($data['payment_method']);
$total_amount = (float)$data['total_amount'];
$items = $data['items'];

echo json_encode(['test_order_id' => $order_id, 'status' => 'ready to insert']);
echo "\n";

// Start transaction
$conn->begin_transaction();

try {
    // Try to insert order
    $query = "INSERT INTO orders (id, customer_name, customer_address, customer_contact, payment_method, total_amount, status) 
              VALUES ('$order_id', '$customer_name', '$customer_address', '$customer_contact', '$payment_method', $total_amount, 'pending')";

    if (!$conn->query($query)) {
        throw new Exception("Failed to insert order: " . $conn->error);
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
    echo json_encode(['success' => true, 'message' => 'Test order created successfully!', 'order_id' => $order_id]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['error' => $e->getMessage()]);
}
?>