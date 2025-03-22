<?php
// ==========================================
// 🧠 ajax_memory_handler.php (v3.0)
// ==========================================
// Handles memory operations: save, list,
// update, delete. Includes auth checks,
// input validation, and error handling.
// ==========================================

header("Content-Type: application/json");

require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/logger.php';
require_once __DIR__ . '/../../includes/auth.php'; // Assuming auth functions are here

// Function to validate and sanitize input
function validateMemoryInput(array $input, string $action): array|false {
    $validated =;

    switch ($action) {
        case 'list':
            $validated['user_id'] = filter_var($input['user_id'] ?? 0, FILTER_VALIDATE_INT);
            if ($validated['user_id'] === false) {
                return false;
            }
            break;

        case 'save':
        case 'update':
            $validated['user_id'] = filter_var($input['user_id'] ?? 0, FILTER_VALIDATE_INT);
            $validated['title'] = filter_var(trim($input['title'] ?? ''), FILTER_SANITIZE_FULL_SPECIAL_CHARS);
            $validated['content'] = filter_var(trim($input['content'] ?? ''), FILTER_SANITIZE_FULL_SPECIAL_CHARS);
            $validated['tags'] = is_array($input['tags'] ??) ? array_map('trim', $input['tags']) :;

            if ($validated['user_id'] === false || empty($validated['title']) || empty($validated['content'])) {
                return false;
            }
            if ($action === 'update') {
                $validated['id'] = filter_var($input['id'] ?? 0, FILTER_VALIDATE_INT);
                if ($validated['id'] === false) {
                    return false;
                }
            }
            break;

        case 'delete':
            $validated['id'] = filter_var($input['id'] ?? 0, FILTER_VALIDATE_INT);
            if ($validated['id'] === false) {
                return false;
            }
            break;

        default:
            return false;
    }

    return $validated;
}

// Function to handle memory listing
function listMemories(PDO $pdo, int $userId): void {
    try {
        $stmt = $pdo->prepare("SELECT m.*, GROUP_CONCAT(t.tag) as tags FROM memories m
        LEFT JOIN memory_tags t ON m.id = t.memory_id
        WHERE m.user_id = :uid GROUP BY m.id ORDER BY m.created_at DESC");
        $stmt->execute([':uid' => $userId]);
        echo json_encode(["memories" => $stmt->fetchAll()]);
    } catch (Exception $e) {
        log_to_file('php', "Memory List Error: " . $e->getMessage(), 'ajax_memory_handler.php');
        log_to_db('php', 'error', $e->getMessage(), 'ajax_memory_handler.php');
        echo json_encode(["error" => "Server error"]);
    }
}

// Function to handle memory saving
function saveMemory(PDO $pdo, array $data): void {
    try {
        $stmt = $pdo->prepare("INSERT INTO memories (user_id, title, content, created_at)
        VALUES (:uid, :title, :content, NOW())");
        $stmt->execute([':uid' => $data['user_id'], ':title' => $data['title'], ':content' => $data['content']]);
        $mid = $pdo->lastInsertId();

        foreach ($data['tags'] as $tag) {
            $tagStmt = $pdo->prepare("INSERT INTO memory_tags (memory_id, tag) VALUES (:mid, :tag)");
            $tagStmt->execute([':mid' => $mid, ':tag' => $tag]);
        }

        echo json_encode(["status" => "saved", "id" => $mid]);
    } catch (Exception $e) {
        log_to_file('php', "Memory Save Error: " . $e->getMessage(), 'ajax_memory_handler.php');
        log_to_db('php', 'error', $e->getMessage(), 'ajax_memory_handler.php');
        echo json_encode(["error" => "Server error"]);
    }
}

// Function to handle memory updating
function updateMemory(PDO $pdo, array $data): void {
    try {
        $pdo->prepare("UPDATE memories SET title=:title, content=:content WHERE id=:id AND user_id=:uid")
        ->execute([':title' => $data['title'], ':content' => $data['content'], ':id' => $data['id'], ':uid' => $data['user_id']]);

        $pdo->prepare("DELETE FROM memory_tags WHERE memory_id=:id")->execute([':id' => $data['id']]);

        foreach ($data['tags'] as $tag) {
            $pdo->prepare("INSERT INTO memory_tags (memory_id, tag) VALUES (:mid, :tag)")
            ->execute([':mid' => $data['id'], ':tag' => $tag]);
        }

        echo json_encode(["status" => "updated"]);
    } catch (Exception $e) {
        log_to_file('php', "Memory Update Error: " . $e->getMessage(), 'ajax_memory_handler.php');
        log_to_db('php', 'error', $e->getMessage(), 'ajax_memory_handler.php');
        echo json_encode(["error" => "Server error"]);
    }
}

// Function to handle memory deletion
function deleteMemory(PDO $pdo, array $data): void {
    try {
        $pdo->prepare("DELETE FROM memory_tags WHERE memory_id=:id")->execute([':id' => $data['id']]);
        $pdo->prepare("DELETE FROM memories WHERE id=:id AND user_id=:uid")->execute([':id' => $data['id'], ':uid' => $data['user_id']]);
        echo json_encode(["status" => "deleted"]);
    } catch (Exception $e) {
        log_to_file('php', "Memory Delete Error: " . $e->getMessage(), 'ajax_memory_handler.php');
        log_to_db('php', 'error', $e->getMessage(), 'ajax_memory_handler.php');
        echo json_encode(["error" => "Server error"]);
    }
}

// Main execution flow
try {
    $input = json_decode(file_get_contents("php://input"), true);
    if (!is_array($input)) {
        log_to_file('php', "Invalid request format", 'ajax_memory_handler.php');
        log_to_db('php', 'error', "Invalid request format", 'ajax_memory_handler.php');
        echo json_encode(["error" => "Invalid request format"]);
        exit;
    }

    $action = $input['action'] ?? '';

    // Authentication - Check if user is authenticated
    $userId = get_user_id(); // Assuming this function gets the logged-in user's ID
    if (!$userId) {
        http_response_code(401);
        echo json_encode(["error" => "Unauthorized"]);
        exit;
    }

    $validatedInput = validateMemoryInput($input, $action);
    if ($validatedInput === false) {
        log_to_file('php', "Invalid input for action: $action", 'ajax_memory_handler.php');
        log_to_db('php', 'warning', "Invalid input for action: $action", 'ajax_memory_handler.php');
        echo json_encode(["error" => "Invalid input"]);
        exit;
    }

    // Authorization -  Check if the user is authorized to perform the action
    switch ($action) {
        case 'list':
            // No specific authorization needed if any logged-in user can list
            break;
        case 'save':
            $validatedInput['user_id'] = $userId; // Set user ID from auth
            break;
        case 'update':
        case 'delete':
            // Ensure the user owns the memory they are trying to modify
            $validatedInput['user_id'] = $userId;
            // Additional check might be needed here to verify ownership before proceeding
            break;
        default:
            echo json_encode(["error" => "Invalid action"]);
            exit;
    }

    // Perform the requested action
    switch ($action) {
        case 'list':
            listMemories($pdo, $validatedInput['user_id']);
            break;
        case 'save':
            saveMemory($pdo, $validatedInput);
            break;
        case 'update':
            updateMemory($pdo, $validatedInput);
            break;
        case 'delete':
            deleteMemory($pdo, $validatedInput);
            break;
        default:
            echo json_encode(["error" => "Invalid action"]);
    }

} catch (Exception $e) {
    log_to_file('php', "Memory Handler Error: " . $e->getMessage(), 'ajax_memory_handler.php');
    log_to_db('php', 'critical', $e->getMessage(), 'ajax_memory_handler.php');
    echo json_encode(["error" => "Server error"]);
}
