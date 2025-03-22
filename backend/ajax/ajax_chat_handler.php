<?php
// ======================================================
// 🚀 ajax_chat_handler.php | Final Version (Fully Enhanced)
// ======================================================
// Secure AJAX handling for chat functionalities
// Actions: getChats, sendMessage
// ======================================================

require_once '../../config/db.php'; // Adjust path as needed
header('Content-Type: application/json');

// Determine action securely
$action = filter_input(INPUT_GET, 'action', FILTER_SANITIZE_STRING);

switch ($action) {
    case 'getChats':
        getChats();
        break;
    case 'sendMessage':
        sendMessage();
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action provided.']);
}

// Fetch all chats from database securely
function getChats() {
    global $pdo;

    try {
        $stmt = $pdo->prepare('SELECT id, title, timestamp FROM chats ORDER BY timestamp DESC');
        $stmt->execute();
        $chats = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'chats' => $chats]);
    } catch (PDOException $e) {
        error_log('Chat fetch error: ' . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Database error while fetching chats.']);
    }
}

// Insert a new message securely
function sendMessage() {
    global $pdo;

    $input = json_decode(file_get_contents('php://input'), true);
    $message = trim($input['message'] ?? '');

    if (empty($message)) {
        echo json_encode(['success' => false, 'message' => 'Cannot send empty message.']);
        return;
    }

    try {
        // Example logic: Insert message, create chat session if not exists
        $pdo->beginTransaction();

        // Insert new chat session if needed (example logic simplified)
        $stmtChat = $pdo->prepare('INSERT INTO chats (title, timestamp) VALUES (:title, NOW())');
        $title = substr($message, 0, 30) . '...';
        $stmtChat->execute([':title' => $title]);
        $chatId = $pdo->lastInsertId();

        // Insert message
        $stmtMsg = $pdo->prepare('INSERT INTO messages (chat_id, sender, content, timestamp) VALUES (:chat_id, :sender, :content, NOW())');
        $stmtMsg->execute([
            ':chat_id' => $chatId,
            ':sender' => 'user',
            ':content' => $message
        ]);

        $pdo->commit();

        // Mock AI Response (Replace with real AI logic later)
        $aiResponse = "AI Response to: " . substr($message, 0, 50);

        // Insert AI response as well
        $stmtAiMsg = $pdo->prepare('INSERT INTO messages (chat_id, sender, content, timestamp) VALUES (:chat_id, :sender, :content, NOW())');
        $stmtAiMsg->execute([
            ':chat_id' => $chatId,
            ':sender' => 'ai',
            ':content' => $aiResponse
        ]);

        echo json_encode(['success' => true, 'response' => $aiResponse]);
    } catch (PDOException $e) {
        $pdo->rollBack();
        error_log('Message insert error: ' . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Database error while sending message.']);
    }
}
