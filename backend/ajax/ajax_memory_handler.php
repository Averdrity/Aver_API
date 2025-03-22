<?php
// ======================================================
// 🚀 ajax_memory_handler.php | Final Version (Enhanced)
// ======================================================
// AJAX handler for user memory management system.
// Actions: getMemories, saveMemory, deleteMemory, updateMemory
// ======================================================

require_once '../../config/db.php'; // Adjust the path accordingly
header('Content-Type: application/json');

// Determine action securely
$action = filter_input(INPUT_GET, 'action', FILTER_SANITIZE_STRING);

switch ($action) {
    case 'getMemories':
        getMemories();
        break;
    case 'saveMemory':
        saveMemory();
        break;
    case 'deleteMemory':
        deleteMemory();
        break;
    case 'updateMemory':
        updateMemory();
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action provided.']);
}

// Get user memories
function getMemories() {
    global $pdo;

    try {
        $stmt = $pdo->prepare('SELECT id, title, tag, content, created_at FROM memories ORDER BY created_at DESC');
        $stmt->execute();
        $memories = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'memories' => $memories]);
    } catch (PDOException $e) {
        error_log('Memory fetch error: ' . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Database error while fetching memories.']);
    }
}

// Save a new memory
function saveMemory() {
    global $pdo;
    $input = json_decode(file_get_contents('php://input'), true);

    $title = trim($input['title'] ?? '');
    $tag = trim($input['tag'] ?? '');
    $content = trim($input['content'] ?? '');

    if (empty($title) || empty($content)) {
        echo json_encode(['success' => false, 'message' => 'Title and content are required.']);
        return;
    }

    try {
        $stmt = $pdo->prepare('INSERT INTO memories (title, tag, content, created_at) VALUES (:title, :tag, :content, NOW())');
        $stmt->execute([
            ':title' => $title,
            ':tag' => $tag,
            ':content' => $content
        ]);

        echo json_encode(['success' => true, 'message' => 'Memory saved successfully.']);
    } catch (PDOException $e) {
        error_log('Memory save error: ' . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Database error while saving memory.']);
    }
}

// Delete a memory
function deleteMemory() {
    global $pdo;
    $input = json_decode(file_get_contents('php://input'), true);
    $memoryId = intval($input['memoryId'] ?? 0);

    if ($memoryId <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid memory ID.']);
        return;
    }

    try {
        $stmt = $pdo->prepare('DELETE FROM memories WHERE id = :id');
        $stmt->execute([':id' => $memoryId]);

        echo json_encode(['success' => true, 'message' => 'Memory deleted successfully.']);
    } catch (PDOException $e) {
        error_log('Memory delete error: ' . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Database error while deleting memory.']);
    }
}

// Update an existing memory
function updateMemory() {
    global $pdo;
    $input = json_decode(file_get_contents('php://input'), true);

    $memoryId = intval($input['memoryId'] ?? 0);
    $title = trim($input['title'] ?? '');
    $tag = trim($input['tag'] ?? '');
    $content = trim($input['content'] ?? '');

    if ($memoryId <= 0 || empty($title) || empty($content)) {
        echo json_encode(['success' => false, 'message' => 'Valid ID, title, and content required.']);
        return;
    }

    try {
        $stmt = $pdo->prepare('UPDATE memories SET title = :title, tag = :tag, content = :content WHERE id = :id');
        $stmt->execute([
            ':title' => $title,
            ':tag' => $tag,
            ':content' => $content,
            ':id' => $memoryId
        ]);

        echo json_encode(['success' => true, 'message' => 'Memory updated successfully.']);
    } catch (PDOException $e) {
        error_log('Memory update error: ' . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Database error while updating memory.']);
    }
}
