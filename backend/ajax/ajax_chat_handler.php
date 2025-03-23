<?php
// File: /backend/ajax/ajax_chat_handler.php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

require_once '../../includes/db.php';
session_start();

$user_id = $_SESSION['user_id'] ?? 1; // TEMP for testing

$action = $_GET['action'] ?? '';

try {
    switch ($action) {

        // ---------------- GET CHATS ----------------
        case 'getChats':
            $stmt = $pdo->prepare('SELECT id, title, created_at FROM chats WHERE user_id = ? ORDER BY updated_at DESC');
            $stmt->execute([$user_id]);
            echo json_encode(['success' => true, 'chats' => $stmt->fetchAll()]);
            break;

            // ---------------- LOAD CHAT ----------------
        case 'loadChat':
            $chat_id = intval($_GET['chatId'] ?? 0);
            if (!$chat_id) throw new Exception("Invalid chat ID");

            $stmt = $pdo->prepare("SELECT sender, content, timestamp FROM chat_messages WHERE chat_id = ? ORDER BY timestamp ASC");
        $stmt->execute([$chat_id]);
        $messages = $stmt->fetchAll();

        $_SESSION['current_chat_id'] = $chat_id;

        echo json_encode(['success' => true, 'messages' => $messages]);
        break;

        // ---------------- RENAME CHAT ----------------
        case 'renameChat':
            $input = json_decode(file_get_contents('php://input'), true);
            $chat_id = intval($input['chatId'] ?? 0);
            $newTitle = trim($input['newTitle'] ?? '');

            if (!$chat_id || !$newTitle) throw new Exception("Missing data");

            $stmt = $pdo->prepare("UPDATE chats SET title = ?, updated_at = NOW() WHERE id = ? AND user_id = ?");
        $stmt->execute([$newTitle, $chat_id, $user_id]);

        echo json_encode(['success' => true]);
        break;

        // ---------------- DELETE CHAT ----------------
        case 'deleteChat':
            $input = json_decode(file_get_contents('php://input'), true);
            $chat_id = intval($input['chatId'] ?? 0);
            if (!$chat_id) throw new Exception("Missing chat ID");

            $stmt = $pdo->prepare("DELETE FROM chats WHERE id = ? AND user_id = ?");
        $stmt->execute([$chat_id, $user_id]);

        echo json_encode(['success' => true]);
        break;

        // ---------------- RESET CHAT SESSION ----------------
        case 'resetChatSession':
            unset($_SESSION['current_chat_id']);
            echo json_encode(['success' => true]);
            break;

            // ---------------- CREATE CHAT (used before sending message) ----------------
        case 'createChat':
            $input = json_decode(file_get_contents('php://input'), true);
            $message = trim($input['message'] ?? '');

            if (!$message) throw new Exception("Message is empty");

            $title = generateChatTitle($message);
        $stmt = $pdo->prepare("INSERT INTO chats (user_id, title) VALUES (?, ?)");
        $stmt->execute([$user_id, $title]);
        $chatId = $pdo->lastInsertId();

        $_SESSION['current_chat_id'] = $chatId;

        echo json_encode([
            'success' => true,
            'chat' => [
                'id' => $chatId,
                'title' => $title,
                'created_at' => date('Y-m-d H:i:s')
            ]
        ]);
        break;

        // ---------------- SEND MESSAGE (insert + respond) ----------------
        case 'sendMessage':
            $input = json_decode(file_get_contents('php://input'), true);
            $message = trim($input['message'] ?? '');
            $chat_id = intval($input['chatId'] ?? 0);

            if (!$message) throw new Exception("Message is empty");

            $pdo->beginTransaction();

        // Create new chat if not exists
        if (!$chat_id) {
            $title = generateChatTitle($message);
            $stmt = $pdo->prepare("INSERT INTO chats (user_id, title) VALUES (?, ?)");
            $stmt->execute([$user_id, $title]);
            $chat_id = $pdo->lastInsertId();
            $_SESSION['current_chat_id'] = $chat_id;
        }

        // Insert user message
        $stmt = $pdo->prepare("INSERT INTO chat_messages (chat_id, sender, content) VALUES (?, 'user', ?)");
        $stmt->execute([$chat_id, $message]);

        // Get AI response
        $ai_response = getAIResponse($message);

        // Insert AI message
        $stmt = $pdo->prepare("INSERT INTO chat_messages (chat_id, sender, content) VALUES (?, 'ai', ?)");
        $stmt->execute([$chat_id, $ai_response]);

        $pdo->commit();

        // Store chat session
        $_SESSION['current_chat_id'] = $chat_id;

        echo json_encode([
            'success' => true,
            'chatId' => $chat_id,
            'response' => $ai_response
        ]);
        break;

        // ---------------- DEFAULT ----------------
        default:
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
            break;
    }

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

// ========== Helper: Chat Title Generator ==========
function generateChatTitle($message) {
    $words = explode(' ', $message);
    $title = implode(' ', array_slice($words, 0, 5));
    return ucfirst(trim($title)) . '...';
}

// ========== Helper: Talk to Ollama AI ==========
function getAIResponse($prompt) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'http://localhost:5000/chat');
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['message' => $prompt]));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

    $response = curl_exec($ch);
    if (curl_errno($ch)) {
        curl_close($ch);
        return "⚠️ AI connection error.";
    }
    curl_close($ch);

    $json = json_decode($response, true);
    return $json['response'] ?? '⚠️ AI did not respond properly.';
}
