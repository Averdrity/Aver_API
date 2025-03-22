<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');
require_once '../../includes/db.php';
session_start();

$user_id = $_SESSION['user_id'] ?? null;
if (!$user_id) {
    exit(json_encode(['success' => false, 'message' => 'Unauthorized']));
}

$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'getMemories':
            $stmt = $pdo->prepare('SELECT id, title, content, created_at FROM memories WHERE user_id = ? ORDER BY created_at DESC');
            $stmt->execute([$user_id]);
            $memories = $stmt->fetchAll();

            foreach ($memories as &$memory) {
                $stmtTags = $pdo->prepare('SELECT tag FROM memory_tags WHERE memory_id = ?');
                $stmtTags->execute([$memory['id']]);
                $memory['tags'] = $stmtTags->fetchAll(PDO::FETCH_COLUMN);
            }
            echo json_encode(['success' => true, 'memories' => $memories]);
            break;

        case 'saveMemory':
            $input = json_decode(file_get_contents('php://input'), true);
            $title = trim($input['title'] ?? '');
            $content = trim($input['content'] ?? '');
            $tags = $input['tags'] ?? [];

            if (!$title || !$content) {
                exit(json_encode(['success' => false, 'message' => 'Title & content required']));
            }

            $pdo->beginTransaction();
            $stmt = $pdo->prepare('INSERT INTO memories (user_id, title, content) VALUES (?, ?, ?)');
            $stmt->execute([$user_id, $title, $content]);
            $memory_id = $pdo->lastInsertId();

            foreach ($tags as $tag) {
                $stmtTag = $pdo->prepare('INSERT INTO memory_tags (memory_id, tag) VALUES (?, ?)');
                $stmtTag->execute([$memory_id, trim($tag)]);
            }
            $pdo->commit();

            echo json_encode(['success' => true]);
            break;

        case 'deleteMemory':
            $memoryId = intval(json_decode(file_get_contents('php://input'), true)['memoryId'] ?? 0);
            $stmt = $pdo->prepare('DELETE FROM memories WHERE id = ? AND user_id = ?');
            $stmt->execute([$memoryId, $user_id]);
            echo json_encode(['success' => true]);
            break;

        default:
            exit(json_encode(['success' => false, 'message' => 'Invalid action']));
    }
} catch (Exception $e) {
    $pdo->rollBack();
    exit(json_encode(['success' => false, 'message' => $e->getMessage()]));
}
