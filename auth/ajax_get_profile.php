<?php
// ===========================================
// 👤 ajax_get_profile.php (v2.0)
// ===========================================
// Securely fetches user profile data (AJAX)
// ===========================================

header('Content-Type: application/json');
require_once '../includes/db.php';
session_start();

$response = ['success' => false, 'profile' => null, 'message' => ''];

if (!isset($_SESSION['user_id'])) {
    $response['message'] = 'You must be logged in to access your profile.';
    exit(json_encode($response));
}

try {
    $stmt = $pdo->prepare("SELECT username, name, country, website, bio, created_at FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $userProfile = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($userProfile) {
        $response['success'] = true;
        $response['profile'] = $userProfile;
    } else {
        $response['message'] = 'Profile not found.';
    }

} catch (PDOException $e) {
    error_log("Profile Retrieval Error: " . $e->getMessage());
    $response['message'] = 'Server error while retrieving profile.';
}

echo json_encode($response);
