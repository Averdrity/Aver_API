<?php
// File: /backend/ajax/ajax_logger.php

header("Content-Type: application/json");

require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/logger.php';

session_start(); // Start the session, in case we need user info

$data = json_decode(file_get_contents("php://input"), true);

$severity = $data['severity'] ?? 'info';
$message  = $data['message']  ?? '';
$file     = $data['file']     ?? 'unknown.php'; // More generic file name
$type     = $data['type']     ?? 'js';
$userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';

// Validate the message (most important)
if (empty($message)) {
    http_response_code(400);
    echo json_encode(["error" => "Missing log message"]);
    exit;
}

// Log to file (no change needed here, logger.php handles this well)
log_to_file($type, $message, $file);

// Log to DB
try {
    // Determine the correct table based on log type
    $table = match ($type) {
        'sql' => 'sql_logs',
        'js' => 'js_logs',
        default => 'error_log_entries', // Default for 'php', 'css', 'html', etc.
    };

    $stmt = $pdo->prepare("
    INSERT INTO $table (severity, message, file, user_agent, user_id, created_at)
    VALUES (:severity, :message, :file, :ua, :uid, NOW())
    ");

    // Get user ID from session, if available
    $userId = $_SESSION['user_id'] ?? null;

    $stmt->execute([
        ':severity' => $severity,
        ':message'  => $message,
        ':file'     => $file,
        ':ua'       => $userAgent,
        ':uid'       => $userId,
    ]);

    echo json_encode(["status" => "logged"]);

} catch (Exception $e) {
    log_to_file('php', "[ajax_logger.php] DB Logging Failed: " . $e->getMessage(), 'ajax_logger.php');
    http_response_code(500); // Internal Server Error
    echo json_encode(["error" => "Database logging error"]);
}
?>
