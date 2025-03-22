<?php
// ===========================================
// 🔐 ajax_login.php (v2.0)
// ===========================================
// Secure user login handler (AJAX)
// ===========================================

header('Content-Type: application/json');
require_once '../includes/db.php';
session_start();

$response = ['success' => false, 'message' => ''];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $input = json_decode(file_get_contents('php://input'), true);
    $username = trim($input['username'] ?? '');
    $password = trim($input['password'] ?? '');

    if (empty($username) || empty($password)) {
        $response['message'] = 'Username and password required.';
        exit(json_encode($response));
    }

    try {
        // Fetch user securely
        $stmt = $pdo->prepare("SELECT id, password FROM users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($password, $user['password'])) {
            // Set session on success
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $username;

            $response['success'] = true;
            $response['message'] = 'Login successful.';
        } else {
            $response['message'] = 'Invalid username or password.';
        }

    } catch (PDOException $e) {
        error_log("Login Error: " . $e->getMessage());
        $response['message'] = 'Server error during login.';
    }
} else {
    $response['message'] = 'Invalid request method.';
}

echo json_encode($response);
