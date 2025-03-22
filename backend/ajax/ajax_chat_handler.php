<?php
// ==========================================
// 🚀 ajax_chat_handler.php (v3.0)
// ==========================================
// Handles chat requests, sends them to the
// Flask/Ollama server, and returns the
// response. Includes error handling,
// input validation, and enhanced logging.
// ==========================================

header("Content-Type: application/json");

require_once __DIR__ . '/../../includes/db.php'; // Assuming database connection is still needed
require_once __DIR__ . '/../../includes/logger.php';

// Configuration (consider moving these to a config file or environment variables)
$flask_url = 'http://127.0.0.1:5000/chat'; // Flask Ollama endpoint

/**
 * Validates the input message.
 *
 * @param string $message The message to validate.
 * @return string|false The validated message or false if invalid.
 */
function validateMessage(string $message): string|false {
    $message = trim($message);
    if (empty($message)) {
        return false;
    }
    // Add more validation rules as needed (e.g., max length, allowed characters)
    return $message;
}

/**
 * Sends the message to the Flask/Ollama server and retrieves the response.
 *
 * @param string $message The message to send.
 * @return array|false The decoded JSON response or false on error.
 */
function getAIResponse(string $message): array|false {
    global $flask_url;

    $payload = json_encode(["message" => $message]);

    $ch = curl_init($flask_url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10); // Connection timeout
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);        // Read timeout

    $result = curl_exec($ch);
    $err = curl_errno($ch); // Use curl_errno instead of curl_error for checking errors
    $errMsg = curl_error($ch);
    curl_close($ch);

    if ($err) {
        log_to_file('php', "Flask CURL error [$err]: $errMsg", 'ajax_chat_handler.php');
        log_to_db('php', 'error', "Flask CURL error [$err]: $errMsg", 'ajax_chat_handler.php');
        return false;
    }

    $json = json_decode($result, true);
    if ($json === null && json_last_error() !== JSON_ERROR_NONE) {
        log_to_file('php', "Invalid JSON response from Flask: " . json_last_error_msg(), 'ajax_chat_handler.php');
        log_to_db('php', 'error', "Invalid JSON response from Flask: " . json_last_error_msg(), 'ajax_chat_handler.php');
        return false;
    }

    return $json;
}

// Main execution flow
try {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!is_array($data) || !isset($data['message'])) {
        log_to_file('php', "Invalid request format", 'ajax_chat_handler.php');
        log_to_db('php', 'error', "Invalid request format", 'ajax_chat_handler.php');
        echo json_encode(["error" => "Invalid request format"]);
        exit;
    }

    $message = validateMessage($data['message']);
    if ($message === false) {
        log_to_file('php', "Empty message received", 'ajax_chat_handler.php');
        log_to_db('php', 'warning', "Empty message received", 'ajax_chat_handler.php');
        echo json_encode(["error" => "Empty message"]);
        exit;
    }

    $response = getAIResponse($message);
    if ($response === false) {
        echo json_encode(["error" => "AI error"]);
        exit;
    }

    $reply = $response['reply'] ?? '[No response]';
    echo json_encode(["reply" => $reply]);

} catch (Exception $e) {
    log_to_file('php', "AI Exception: " . $e->getMessage(), 'ajax_chat_handler.php');
    log_to_db('php', 'critical', $e->getMessage(), 'ajax_chat_handler.php');
    echo json_encode(["error" => "Server error"]);
}
