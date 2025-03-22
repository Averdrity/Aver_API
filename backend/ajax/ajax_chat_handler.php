<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');
require_once '../../config/db.php';
session_start();

$user_id = $_SESSION['user_id'] ?? null;
if (!$user_id) {
    exit(json_encode(['success' => false, 'message' => 'Unauthorized']));
}

$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'getChats':
            $stmt = $pdo->prepare('SELECT id, title, created_at FROM chats WHERE user_id = ? ORDER BY updated_at DESC');
            $stmt->execute([$user_id]);
            echo json_encode(['success' => true, 'chats' => $stmt->fetchAll()]);
            break;

        case 'getMessages':
            $chatId = intval($_GET['chat_id'] ?? 0);
            $stmt = $pdo->prepare('SELECT sender, content, timestamp FROM chat_messages WHERE chat_id = ? ORDER BY timestamp ASC');
            $stmt->execute([$chatId]);
            echo json_encode(['success' => true, 'messages' => $stmt->fetchAll()]);
            break;

        case 'sendMessage':
            $input = json_decode(file_get_contents('php://input'), true);
            $message = trim($input['message'] ?? '');

            if (!$message) {
                exit(json_encode(['success' => false, 'message' => 'Message empty']));
            }

            $pdo->beginTransaction();

            $title = substr($message, 0, 50);
            $stmt = $pdo->prepare('INSERT INTO chats (user_id, title) VALUES (?, ?)');
            $stmt->execute([$user_id, $title]);
            $chat_id = $pdo->lastInsertId();

            $stmtMsg = $pdo->prepare('INSERT INTO chat_messages (chat_id, sender, content) VALUES (?, ?, ?)');
            $stmtMsg->execute([$chat_id, 'user', $message]);

            $ai_response = "AI says: " . substr($message, 0, 50);
            $stmtAI = $pdo->prepare('INSERT INTO chat_messages (chat_id, sender, content) VALUES (?, ?, ?)');
            $stmtAI->execute([$chat_id, 'ai', $ai_response]);

            $pdo->commit();

            echo json_encode(['success' => true, 'response' => $ai_response]);
            break;

        default:
            exit(json_encode(['success' => false, 'message' => 'Invalid action']));
    }
} catch (Exception $e) {
    $pdo->rollBack();
    exit(json_encode(['success' => false, 'message' => $e->getMessage()]));
}
