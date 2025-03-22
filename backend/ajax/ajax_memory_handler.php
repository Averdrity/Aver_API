<?php
// File: /backend/ajax/ajax_memory_handler.php

header("Content-Type: application/json");

require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/logger.php';

$input = json_decode(file_get_contents("php://input"), true);
$action = $input['action'] ?? '';

try {
    switch ($action) {
        case 'list':
            $user_id = intval($input['user_id'] ?? 0);
            $stmt = $pdo->prepare("SELECT m.*, GROUP_CONCAT(t.tag) as tags FROM memories m
            LEFT JOIN memory_tags t ON m.id = t.memory_id
            WHERE m.user_id = :uid GROUP BY m.id ORDER BY m.created_at DESC");
            $stmt->execute([':uid' => $user_id]);
            echo json_encode(["memories" => $stmt->fetchAll()]);
            break;

        case 'save':
            $user_id = intval($input['user_id'] ?? 0);
            $title = trim($input['title']);
            $content = trim($input['content']);
            $tags = $input['tags'] ?? [];

            $stmt = $pdo->prepare("INSERT INTO memories (user_id, title, content, created_at)
            VALUES (:uid, :title, :content, NOW())");
            $stmt->execute([':uid' => $user_id, ':title' => $title, ':content' => $content]);
            $mid = $pdo->lastInsertId();

            foreach ($tags as $tag) {
                $tagStmt = $pdo->prepare("INSERT INTO memory_tags (memory_id, tag) VALUES (:mid, :tag)");
                $tagStmt->execute([':mid' => $mid, ':tag' => $tag]);
            }

            echo json_encode(["status" => "saved", "id" => $mid]);
            break;

        case 'update':
            $mid = intval($input['id']);
            $title = trim($input['title']);
            $content = trim($input['content']);
            $tags = $input['tags'] ?? [];

            $pdo->prepare("UPDATE memories SET title=:title, content=:content WHERE id=:id")
            ->execute([':title' => $title, ':content' => $content, ':id' => $mid]);

            $pdo->prepare("DELETE FROM memory_tags WHERE memory_id=:id")
            ->execute([':id' => $mid]);

            foreach ($tags as $tag) {
                $pdo->prepare("INSERT INTO memory_tags (memory_id, tag) VALUES (:mid, :tag)")
                ->execute([':mid' => $mid, ':tag' => $tag]);
            }

            echo json_encode(["status" => "updated"]);
            break;

        case 'delete':
            $mid = intval($input['id']);
            $pdo->prepare("DELETE FROM memory_tags WHERE memory_id=:id")->execute([':id' => $mid]);
            $pdo->prepare("DELETE FROM memories WHERE id=:id")->execute([':id' => $mid]);
            echo json_encode(["status" => "deleted"]);
            break;

        default:
            echo json_encode(["error" => "Invalid action"]);
    }
} catch (Exception $e) {
    log_to_file('php', "Memory Handler Error: " . $e->getMessage(), 'ajax_memory_handler.php');
    log_to_db('php', 'error', $e->getMessage(), 'ajax_memory_handler.php');
    echo json_encode(["error" => "Server error"]);
}

