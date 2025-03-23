<?php
// ===========================================
// 🔐 ajax_register.php (v3.0)
// ===========================================
// Secure User Registration Handler (AJAX)
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
$confirmPassword = trim($input['confirmPassword'] ?? '');

// Basic validation
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
    // Check if username already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$username]);

    if ($stmt->fetch()) {
        $response['message'] = 'Username already exists. Try another.';
        exit(json_encode($response));
    }

    // Secure password hashing
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Insert new user
    $stmt = $pdo->prepare("INSERT INTO users (username, password, registered_at) VALUES (?, ?, NOW())");
    $stmt->execute([$username, $hashedPassword]);

    $newUserId = $pdo->lastInsertId();

    // Start user session
    session_regenerate_id(true);
    $_SESSION['user_id'] = $newUserId;
    $_SESSION['username'] = $username;

    // Optional logging
    log_to_file('php', "User registered: $username", 'ajax_register.php');
    log_to_db('php', 'info', "Registration: $username", 'ajax_register.php');

    $response['success'] = true;
    $response['message'] = 'Registration successful. Logging you in...';

} catch (PDOException $e) {
    error_log("Registration Error: " . $e->getMessage());
    $response['message'] = 'Registration failed due to server error.';
}

echo json_encode($response);
