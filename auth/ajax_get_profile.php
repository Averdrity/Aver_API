<?php
// ===========================================
// 👤 ajax_get_profile.php (v3.0)
// Securely fetches user profile data (AJAX)
// ===========================================

header('Content-Type: application/json');
session_start();
require_once __DIR__ . '/../includes/db.php';

$response = [
    'success' => false,
'profile' => null,
'message' => ''
];

// Check login session
if (!isset($_SESSION['user_id'])) {
    $response['message'] = 'You must be logged in to access your profile.';
    echo json_encode($response);
    exit;
}

try {
    $stmt = $pdo->prepare("
    SELECT username, name, country, website, bio, created_at
    FROM users
    WHERE id = ?
    LIMIT 1
    ");
    $stmt->execute([$_SESSION['user_id']]);
    $profile = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($profile) {
        $response['success'] = true;
        $response['profile'] = $profile;
    } else {
        $response['message'] = 'Profile not found.';
    }

} catch (PDOException $e) {
    error_log("[Profile Fetch Error] " . $e->getMessage());
    $response['message'] = 'Server error while retrieving profile.';
}

echo json_encode($response);
