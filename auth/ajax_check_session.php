<?php
// ===========================================
// 🔐 ajax_check_session.php (v3.0)
// ===========================================
// Securely Verifies Active User Session (AJAX)
// ===========================================

header('Content-Type: application/json');
require_once '../includes/logger.php'; // Optional logging
session_start();

$response = [
    'authenticated' => false,
'username' => null,
'user_id'  => null,
'message'  => ''
];

try {
    if (isset($_SESSION['user_id']) && isset($_SESSION['username'])) {
        $response['authenticated'] = true;
        $response['username'] = $_SESSION['username'];
        $response['user_id'] = $_SESSION['user_id'];
        $response['message'] = 'Session active.';
    } else {
        $response['message'] = 'No active session.';
    }

    // Optional logging
    // log_to_file('php', 'Session check requested.', 'ajax_check_session.php');
    // log_to_db('php', 'info', 'Session status check', 'ajax_check_session.php');

} catch (Exception $e) {
    error_log("Session Check Error: " . $e->getMessage());
    $response['message'] = 'Server error during session check.';
}

echo json_encode($response);
