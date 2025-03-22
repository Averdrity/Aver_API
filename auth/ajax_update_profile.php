<?php
// File: /auth/ajax_update_profile.php

session_start();
header("Content-Type: application/json");

require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/logger.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "Not logged in"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$name = trim($data['name'] ?? '');
$country = trim($data['country'] ?? '');
$website = trim($data['website'] ?? '');
$bio = trim($data['bio'] ?? '');

try {
    $stmt = $pdo->prepare("UPDATE users
    SET name=:name, country=:country, website=:website, bio=:bio
    WHERE id=:id");
    $stmt->execute([
        ':name' => $name,
        ':country' => $country,
        ':website' => $website,
        ':bio' => $bio,
        ':id' => $_SESSION['user_id']
    ]);

    log_to_file('php', "Profile updated: {$_SESSION['username']}", 'ajax_update_profile.php');
    log_to_db('php', 'info', "Profile updated by user", 'ajax_update_profile.php');

    echo json_encode(["success" => true]);

} catch (Exception $e) {
    log_to_file('php', "Profile update error: " . $e->getMessage(), 'ajax_update_profile.php');
    log_to_db('php', 'error', $e->getMessage(), 'ajax_update_profile.php');
    echo json_encode(["error" => "Server error"]);
}

