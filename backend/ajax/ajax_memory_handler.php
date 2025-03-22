<?php
// ===========================================
// 🧠 ajax_memory_handler.php (v3.0)
// ===========================================
// Advanced memory management system (AJAX)
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

    case 'getMemories':
        try {
            $stmt = $pdo->prepare("SELECT id, title, content, tags, created_at FROM memories WHERE user_id = ? ORDER BY created_at DESC");
            $stmt->execute([$_SESSION['user_id']]);
            $memories = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $response = ['success' => true, 'memories' => $memories];
        } catch (PDOException $e) {
            error_log("Get Memories Error: " . $e->getMessage());
            $response['message'] = 'Server error fetching memories.';
        }
        break;

    case 'saveMemory':
        $input = json_decode(file_get_contents('php://input'), true);
        $title = trim($input['title'] ?? 'Untitled');
        $content = trim($input['content'] ?? '');
        $tags = trim($input['tags'] ?? '');

        if (empty($content)) {
            $response['message'] = 'Memory content cannot be empty.';
            break;
        }

        try {
            $stmt = $pdo->prepare("INSERT INTO memories (user_id, title, content, tags, created_at) VALUES (?, ?, ?, ?, NOW())");
            $stmt->execute([$_SESSION['user_id'], $title, $content, $tags]);
            $response = ['success' => true];
        } catch (PDOException $e) {
            error_log("Save Memory Error: " . $e->getMessage());
            $response['message'] = 'Server error saving memory.';
        }
        break;

    case 'editMemory':
        $memoryId = $_GET['memoryId'] ?? '';
        $input = json_decode(file_get_contents('php://input'), true);
        $newContent = trim($input['content'] ?? '');

        try {
            $stmt = $pdo->prepare("UPDATE memories SET content = ? WHERE id = ? AND user_id = ?");
            $stmt->execute([$newContent, $memoryId, $_SESSION['user_id']]);
            $response = ['success' => true];
        } catch (PDOException $e) {
            error_log("Edit Memory Error: " . $e->getMessage());
            $response['message'] = 'Server error editing memory.';
        }
        break;

    case 'deleteMemory':
        $memoryId = $_GET['memoryId'] ?? '';

        try {
            $stmt = $pdo->prepare("DELETE FROM memories WHERE id = ? AND user_id = ?");
            $stmt->execute([$memoryId, $_SESSION['user_id']]);
            $response = ['success' => true];
        } catch (PDOException $e) {
            error_log("Delete Memory Error: " . $e->getMessage());
            $response['message'] = 'Server error deleting memory.';
        }
        break;

    case 'clearAll':
        try {
            $stmt = $pdo->prepare("DELETE FROM memories WHERE user_id = ?");
            $stmt->execute([$_SESSION['user_id']]);
            $response = ['success' => true];
        } catch (PDOException $e) {
            error_log("Clear Memories Error: " . $e->getMessage());
            $response['message'] = 'Server error clearing memories.';
        }
        break;

    default:
        $response['message'] = 'Unsupported action.';
        break;
}

echo json_encode($response);
