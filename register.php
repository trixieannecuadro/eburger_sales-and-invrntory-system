<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJSON(['error' => 'Invalid request method'], 400);
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['username']) || !isset($data['password'])) {
    sendJSON(['error' => 'Missing username or password'], 400);
}

$username = $conn->real_escape_string($data['username']);
$password = password_hash($data['password'], PASSWORD_BCRYPT);
$role = isset($data['role']) ? $data['role'] : 'employee';

// Check if username exists
$check = $conn->query("SELECT id FROM users WHERE username = '$username'");
if ($check->num_rows > 0) {
    sendJSON(['error' => 'Username already exists'], 400);
}

// Insert new user
if ($conn->query("INSERT INTO users (username, password, role) VALUES ('$username', '$password', '$role')")) {
    sendJSON(['success' => true, 'message' => 'User registered successfully']);
} else {
    sendJSON(['error' => 'Registration failed: ' . $conn->error], 500);
}
?>