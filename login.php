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
$password = $data['password'];

// Query user
$result = $conn->query("SELECT id, username, password, role FROM users WHERE username = '$username'");

if ($result->num_rows === 0) {
    sendJSON(['error' => 'Invalid credentials'], 401);
}

$user = $result->fetch_assoc();

// Verify password (using bcrypt hash)
if (!password_verify($password, $user['password'])) {
    sendJSON(['error' => 'Invalid credentials'], 401);
}

// Create session
session_start();
$_SESSION['user_id'] = $user['id'];
$_SESSION['username'] = $user['username'];
$_SESSION['role'] = $user['role'];

sendJSON([
    'success' => true,
    'message' => 'Login successful',
    'user' => [
        'id' => $user['id'],
        'username' => $user['username'],
        'role' => $user['role']
    ]
]);
?>