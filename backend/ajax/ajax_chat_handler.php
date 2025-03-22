<?php
// File: /backend/ajax/ajax_chat_handler.php

header("Content-Type: application/json");

require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/logger.php';

$data = json_decode(file_get_contents("php://input"), true);
$message = trim($data['message'] ?? '');

if (!$message) {
    echo json_encode(["error" => "Empty message"]);
    exit;
}

// Send to Flask server
$flask_url = 'http://127.0.0.1:5000/chat'; // Flask Ollama endpoint

try {
    $payload = json_encode(["message" => $message]);

    $ch = curl_init($flask_url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $result = curl_exec($ch);
    $err = curl_error($ch);
    curl_close($ch);

    if ($err) {
        log_to_file('php', "Flask CURL error: $err", 'ajax_chat_handler.php');
        log_to_db('php', 'error', $err, 'ajax_chat_handler.php');
        echo json_encode(["error" => "AI error"]);
        exit;
    }

    $json = json_decode($result, true);
    $reply = $json['reply'] ?? '[No response]';

    echo json_encode(["reply" => $reply]);

} catch (Exception $e) {
    log_to_file('php', "AI Exception: " . $e->getMessage(), 'ajax_chat_handler.php');
    log_to_db('php', 'critical', $e->getMessage(), 'ajax_chat_handler.php');
    echo json_encode(["error" => "Server error"]);
}

