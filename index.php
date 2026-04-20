<?php
// ========================================
// admin/index.php - Admin Entry Point
// ========================================

session_start();

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    // Redirect to login page
    header('Location: ../login.html');
    exit();
}

// If logged in, redirect to dashboard
header('Location: dashboard.html');
exit();
?>