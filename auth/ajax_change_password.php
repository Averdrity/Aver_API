<?php
// File: /auth/ajax_change_password.php

session_start();
header("Content-Type: application/json");

require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/logger.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "Not logged in"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$current = trim($data['current'] ?? '');
$new     = trim($data['new'] ?? '');
$confirm = trim($data['confirm'] ?? '');

if (!$current || !$new || !$confirm) {
    echo json_encode(["error" => "All fields are required."]);
    exit;
}

if ($new !== $confirm) {
    echo json_encode(["error" => "New passwords do not match."]);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT password FROM users WHERE id = :id");
    $stmt->execute([':id' => $_SESSION['user_id']]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($current, $user['password'])) {
        echo json_encode(["error" => "Incorrect current password."]);
        exit;
    }

    $hash = password_hash($new, PASSWORD_BCRYPT);
    $stmt = $pdo->prepare("UPDATE users SET password=:pwd WHERE id=:id");
    $stmt->execute([':pwd' => $hash, ':id' => $_SESSION['user_id']]);

    log_to_file('php', "Password changed: {$_SESSION['username']}", 'ajax_change_password.php');
    log_to_db('php', 'info', "User changed password", 'ajax_change_password.php');

    echo json_encode(["success" => true]);

} catch (Exception $e) {
    log_to_file('php', "Password change error: " . $e->getMessage(), 'ajax_change_password.php');
    log_to_db('php', 'error', $e->getMessage(), 'ajax_change_password.php');
    echo json_encode(["error" => "Server error"]);
}

