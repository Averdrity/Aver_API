<?php
// File: /backend/ajax/ajax_logger.php

header("Content-Type: application/json");

require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/logger.php';

$data = json_decode(file_get_contents("php://input"), true);

$severity = $data['severity'] ?? 'info';
$message  = $data['message']  ?? '';
$file     = $data['file']     ?? 'unknown.js';
$type     = $data['type']     ?? 'js';
$userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';

if (empty($message)) {
    http_response_code(400);
    echo json_encode(["error" => "Missing log message"]);
    exit;
}

// Log to file
log_to_file($type, $message, $file);

// Log to DB
try {
    $stmt = $pdo->prepare("
    INSERT INTO js_logs (severity, message, file, user_agent, created_at)
    VALUES (:severity, :message, :file, :ua, NOW())
    ");
    $stmt->execute([
        ':severity' => $severity,
        ':message'  => $message,
        ':file'     => $file,
        ':ua'       => $userAgent
    ]);
} catch (Exception $e) {
    log_to_file('php', "[ajax_logger.php] DB Logging Failed: " . $e->getMessage());
}

echo json_encode(["status" => "logged"]);

