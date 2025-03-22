<?php
// File: /auth/ajax_get_profile.php

session_start();
header("Content-Type: application/json");

require_once __DIR__ . '/../includes/db.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "Not logged in"]);
    exit;
}

try {
    $uid = $_SESSION['user_id'];

    $stmt = $pdo->prepare("SELECT name, country, website, bio FROM users WHERE id = :uid LIMIT 1");
    $stmt->execute([':uid' => $uid]);
    $profile = $stmt->fetch();

    echo json_encode(["profile" => $profile]);

} catch (Exception $e) {
    echo json_encode(["error" => "Server error"]);
}

