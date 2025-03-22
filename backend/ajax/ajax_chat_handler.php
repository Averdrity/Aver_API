<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');
require_once '../../includes/db.php';
session_start();

$user_id = $_SESSION['user_id'] ?? 1; // TEMP for testing clearly

$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'getChats':
            $stmt = $pdo->prepare('SELECT id, title, created_at FROM chats WHERE user_id = ? ORDER BY updated_at DESC');
            $stmt->execute([$user_id]);
            echo json_encode(['success' => true, 'chats' => $stmt->fetchAll()]);
            break;

        case 'sendMessage':
            $input = json_decode(file_get_contents('php://input'), true);
            $message = trim($input['message'] ?? '');

            if (!$message) {
                exit(json_encode(['success' => false, 'message' => 'Message empty']));
            }

            // Start DB Transaction
            $pdo->beginTransaction();

            // Create new chat session
            $title = substr($message, 0, 50);
            $stmt = $pdo->prepare('INSERT INTO chats (user_id, title) VALUES (?, ?)');
            $stmt->execute([$user_id, $title]);
            $chat_id = $pdo->lastInsertId();

            // Insert user message
            $stmtMsg = $pdo->prepare('INSERT INTO chat_messages (chat_id, sender, content) VALUES (?, ?, ?)');
            $stmtMsg->execute([$chat_id, 'user', $message]);

            // Get real AI response from Ollama
            $ai_response = getAIResponse($message);

            // Insert AI message
            $stmtAI = $pdo->prepare('INSERT INTO chat_messages (chat_id, sender, content) VALUES (?, ?, ?)');
            $stmtAI->execute([$chat_id, 'ai', $ai_response]);

            // Commit transaction
            $pdo->commit();

            // Respond back to JS clearly
            echo json_encode(['success' => true, 'response' => $ai_response]);
            break;

        default:
            exit(json_encode(['success' => false, 'message' => 'Invalid action']));
    }
} catch (Exception $e) {
    $pdo->rollBack();
    exit(json_encode(['success' => false, 'message' => $e->getMessage()]));
}

// ----------------------------------
// Communicate with Ollama via Python
// ----------------------------------
function getAIResponse($prompt) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'http://localhost:5000/chat');
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['message' => $prompt]));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

    $response = curl_exec($ch);

    if (curl_errno($ch)) {
        $error_msg = curl_error($ch);
        curl_close($ch);
        return "Curl error: " . $error_msg;
    }

    curl_close($ch);
    $result = json_decode($response, true);
    return $result['response'] ?? 'AI model failed to respond correctly.';
}


