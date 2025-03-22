<?php
// File: /auth/ajax_login.php

session_start();
header("Content-Type: application/json");

require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/logger.php';

$data = json_decode(file_get_contents("php://input"), true);
$username = trim($data['username'] ?? '');
$password = trim($data['password'] ?? '');

if (!$username || !$password) {
    echo json_encode(["error" => "Username and password required."]);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = :username LIMIT 1");
    $stmt->execute([':username' => $username]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password'])) {
        log_to_db('php', 'warning', "Login failed for $username", 'ajax_login.php');
        echo json_encode(["error" => "Invalid credentials."]);
        exit;
    }

    // Set session
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];

    log_to_file('php', "User logged in: $username", 'ajax_login.php');
    log_to_db('php', 'info', "Login: $username", 'ajax_login.php');

    echo json_encode(["success" => true, "username" => $username]);

} catch (Exception $e) {
    log_to_file('php', "Login error: " . $e->getMessage(), 'ajax_login.php');
    log_to_db('php', 'error', $e->getMessage(), 'ajax_login.php');
    echo json_encode(["error" => "Server error"]);
}

