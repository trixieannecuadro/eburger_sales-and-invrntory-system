<?php
// test_db_connection.php

// Database connection parameters
$host = 'localhost';
$username = 'your_username'; // replace with your database username
$password = 'your_password'; // replace with your database password
$database = 'your_database'; // replace with your database name

// Create the connection
$conn = new mysqli($host, $username, $password, $database);

// Check the connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

echo "Connected successfully\n";

// Test the add_inventory.php script
$query = "INSERT INTO inventory (item_name, quantity) VALUES ('Test Item', 10)";
if ($conn->query($query) === TRUE) {
    echo "New record created successfully\n";
} else {
    echo "Error: " . $query . "\n" . $conn->error;
}

// Close the connection
$conn->close();
?>