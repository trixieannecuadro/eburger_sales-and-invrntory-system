<?php
// ========================================
// DATABASE CONNECTION - config/db.php
// ========================================

define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', ''); // Leave blank if no password
define('DB_NAME', 'explosive_burger');

// Create connection
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// Check connection
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $conn->connect_error]);
    die();
}

// Set charset to UTF-8
$conn->set_charset("utf8");

// Helper function to send JSON responses
function sendJSON($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit();
}

// Helper function to log errors
function logError($message) {
    $log_file = __DIR__ . '/../error_log.txt';
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($log_file, "[$timestamp] $message\n", FILE_APPEND);
}
?>