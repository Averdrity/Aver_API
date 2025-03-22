<?php
// ===========================================
// 🔐 ajax_register.php (v2.0)
// ===========================================
// Secure user registration handler (AJAX)
// ===========================================

header('Content-Type: application/json');
require_once '../includes/db.php';
session_start();

$response = ['success' => false, 'message' => ''];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // Get input data safely
    $input = json_decode(file_get_contents('php://input'), true);
    $username = trim($input['username'] ?? '');
    $password = trim($input['password'] ?? '');
    $confirmPassword = trim($input['confirmPassword'] ?? '');

    // Validate inputs
    if (empty($username) || empty($password) || empty($confirmPassword)) {
        $response['message'] = 'All fields are required.';
        exit(json_encode($response));
    }

    if ($password !== $confirmPassword) {
        $response['message'] = 'Passwords do not match.';
        exit(json_encode($response));
    }

    if (strlen($username) < 3 || strlen($password) < 6) {
        $response['message'] = 'Username must be at least 3 characters and password at least 6 characters.';
        exit(json_encode($response));
    }

    try {
        // Check if username exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
        $stmt->execute([$username]);

        if ($stmt->fetch()) {
            $response['message'] = 'Username already exists.';
            exit(json_encode($response));
        }

        // Hash the password securely
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        // Insert new user
        $stmt = $pdo->prepare("INSERT INTO users (username, password, created_at) VALUES (?, ?, NOW())");
        $stmt->execute([$username, $hashedPassword]);

        // Start session upon successful registration
        $_SESSION['user_id'] = $pdo->lastInsertId();
        $_SESSION['username'] = $username;

        $response['success'] = true;
        $response['message'] = 'Registration successful. Logging you in...';

    } catch (PDOException $e) {
        error_log("Registration Error: " . $e->getMessage());
        $response['message'] = 'Registration failed due to server error.';
    }
} else {
    $response['message'] = 'Invalid request method.';
}

echo json_encode($response);
