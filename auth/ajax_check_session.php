<?php
// ===========================================
// 🔐 ajax_check_session.php (v2.0)
// ===========================================
// Securely verifies active user session (AJAX)
// ===========================================

header('Content-Type: application/json');
session_start();

$response = [
    'authenticated' => false,
'username' => null,
'user_id' => null
];

if (isset($_SESSION['user_id']) && isset($_SESSION['username'])) {
    $response['authenticated'] = true;
    $response['username'] = $_SESSION['username'];
    $response['user_id'] = $_SESSION['user_id'];
}

echo json_encode($response);
