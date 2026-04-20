<?php
header('Content-Type: application/json');
session_start();
session_destroy();
sendJSON(['success' => true, 'message' => 'Logged out successfully']);
?>