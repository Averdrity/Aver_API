<?php
// ===========================================
// 🔐 ajax_login.php (v3.0)
// ===========================================
// Secure User Login Handler (AJAX)
// ===========================================

header('Content-Type: application/json');
require_once '../includes/db.php';
require_once '../includes/logger.php';
session_start();

$response = ['success' => false, 'message' => ''];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['message'] = 'Invalid request method.';
    exit(json_encode($response));
}

$input = json_decode(file_get_contents('php://input'), true);
$username = trim($input['username'] ?? '');
$password = trim($input['password'] ?? '');

if (empty($username) || empty($password)) {
    $response['message'] = 'Username and password are required.';
    exit(json_encode($response));
}

try {
    // Fetch user securely
    $stmt = $pdo->prepare("SELECT id, username, password FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password'])) {
        // Set session securely
        session_regenerate_id(true);
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];

        // Optional logging
        log_to_file('php', "User login success: {$user['username']}", 'ajax_login.php');
        log_to_db('php', 'info', "Login: {$user['username']}", 'ajax_login.php');

        $response['success'] = true;
        $response['message'] = 'Login successful.';
    } else {
        $response['message'] = 'Invalid username or password.';
        log_to_file('php', "Login failed for user: $username", 'ajax_login.php');
    }

} catch (PDOException $e) {
    error_log("Login Error: " . $e->getMessage());
    $response['message'] = 'Server error during login.';
}

echo json_encode($response);
