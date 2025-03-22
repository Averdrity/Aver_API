<?php
// ===========================================
// 💬 ajax_chat_handler.php (v3.0)
// ===========================================
// Handles AJAX chat operations securely
// ===========================================

header('Content-Type: application/json');
require_once '../../includes/db.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    exit(json_encode(['success' => false, 'message' => 'Authentication required.']));
}

$action = $_GET['action'] ?? '';
$response = ['success' => false, 'message' => 'Invalid action.'];

switch ($action) {

    case 'getChats':
        try {
            $stmt = $pdo->prepare("SELECT id, title, created_at FROM chats WHERE user_id = ? ORDER BY created_at DESC");
            $stmt->execute([$_SESSION['user_id']]);
            $chats = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $response = ['success' => true, 'chats' => $chats];
        } catch (PDOException $e) {
            error_log("Get Chats Error: " . $e->getMessage());
            $response['message'] = 'Server error fetching chats.';
        }
        break;

    case 'getMessages':
        $chatId = $_GET['chatId'] ?? '';
        try {
            $stmt = $pdo->prepare("SELECT role, content FROM messages WHERE chat_id = ? ORDER BY created_at ASC");
            $stmt->execute([$chatId]);
            $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $chatTitleStmt = $pdo->prepare("SELECT title FROM chats WHERE id = ?");
            $chatTitleStmt->execute([$chatId]);
            $chatTitle = $chatTitleStmt->fetchColumn();

            $response = ['success' => true, 'chatTitle' => $chatTitle, 'messages' => $messages];
        } catch (PDOException $e) {
            error_log("Get Messages Error: " . $e->getMessage());
            $response['message'] = 'Server error fetching messages.';
        }
        break;

    case 'saveMessage':
        $input = json_decode(file_get_contents('php://input'), true);
        $chatId = $input['chatId'] ?? null;
        $role = $input['role'] ?? '';
        $content = $input['content'] ?? '';

        try {
            if (!$chatId) {
                $title = substr($content, 0, 30);
                $stmt = $pdo->prepare("INSERT INTO chats (user_id, title, created_at) VALUES (?, ?, NOW())");
                $stmt->execute([$_SESSION['user_id'], $title]);
                $chatId = $pdo->lastInsertId();
            }

            $msgStmt = $pdo->prepare("INSERT INTO messages (chat_id, role, content, created_at) VALUES (?, ?, ?, NOW())");
            $msgStmt->execute([$chatId, $role, $content]);

            $response = ['success' => true, 'chatId' => $chatId];

        } catch (PDOException $e) {
            error_log("Save Message Error: " . $e->getMessage());
            $response['message'] = 'Server error saving message.';
        }
        break;

    case 'renameChat':
        $chatId = $_GET['chatId'] ?? '';
        $input = json_decode(file_get_contents('php://input'), true);
        $newTitle = $input['title'] ?? '';

        try {
            $stmt = $pdo->prepare("UPDATE chats SET title = ? WHERE id = ? AND user_id = ?");
            $stmt->execute([$newTitle, $chatId, $_SESSION['user_id']]);
            $response = ['success' => true];
        } catch (PDOException $e) {
            error_log("Rename Chat Error: " . $e->getMessage());
            $response['message'] = 'Server error renaming chat.';
        }
        break;

    case 'deleteChat':
        $chatId = $_GET['chatId'] ?? '';

        try {
            $stmt = $pdo->prepare("DELETE FROM chats WHERE id = ? AND user_id = ?");
            $stmt->execute([$chatId, $_SESSION['user_id']]);

            $msgStmt = $pdo->prepare("DELETE FROM messages WHERE chat_id = ?");
            $msgStmt->execute([$chatId]);

            $response = ['success' => true];
        } catch (PDOException $e) {
            error_log("Delete Chat Error: " . $e->getMessage());
            $response['message'] = 'Server error deleting chat.';
        }
        break;

    default:
        $response['message'] = 'Unsupported action.';
        break;
}

echo json_encode($response);
