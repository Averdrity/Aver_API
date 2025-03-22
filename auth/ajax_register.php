<?php
// File: /auth/ajax_register.php

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
    // Check existing user
    $check = $pdo->prepare("SELECT id FROM users WHERE username = :username");
    $check->execute([':username' => $username]);

    if ($check->fetch()) {
        echo json_encode(["error" => "Username already exists."]);
        exit;
    }

    // Create new user
    $hash = password_hash($password, PASSWORD_BCRYPT);
    $stmt = $pdo->prepare("INSERT INTO users (username, password, registered_at) VALUES (:u, :p, NOW())");
    $stmt->execute([':u' => $username, ':p' => $hash]);

    log_to_file('php', "New registration: $username", 'ajax_register.php');
    log_to_db('php', 'info', "Registered new user: $username", 'ajax_register.php');

    echo json_encode(["success" => true]);

} catch (Exception $e) {
    log_to_file('php', "Registration error: " . $e->getMessage(), 'ajax_register.php');
    log_to_db('php', 'error', $e->getMessage(), 'ajax_register.php');
    echo json_encode(["error" => "Server error"]);
}

