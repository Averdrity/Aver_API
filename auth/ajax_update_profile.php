<?php
// ===========================================
// 👤 ajax_update_profile.php (v2.0)
// ===========================================
// Secure profile information update (AJAX)
// ===========================================

header('Content-Type: application/json');
require_once '../includes/db.php';
session_start();

$response = ['success' => false, 'message' => ''];

if (!isset($_SESSION['user_id'])) {
    $response['message'] = 'You must be logged in to update your profile.';
    exit(json_encode($response));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $input = json_decode(file_get_contents('php://input'), true);

    // Sanitize & validate inputs
    $name = trim(filter_var($input['name'] ?? '', FILTER_SANITIZE_STRING));
    $country = trim(filter_var($input['country'] ?? '', FILTER_SANITIZE_STRING));
    $website = trim(filter_var($input['website'] ?? '', FILTER_VALIDATE_URL));
    $bio = trim(filter_var($input['bio'] ?? '', FILTER_SANITIZE_STRING));

    try {
        $stmt = $pdo->prepare("
        UPDATE users
        SET name = ?, country = ?, website = ?, bio = ?
        WHERE id = ?
        ");

        $stmt->execute([$name, $country, $website, $bio, $_SESSION['user_id']]);

        $response['success'] = true;
        $response['message'] = 'Profile updated successfully.';

    } catch (PDOException $e) {
        error_log("Profile Update Error: " . $e->getMessage());
        $response['message'] = 'Server error while updating profile.';
    }
} else {
    $response['message'] = 'Invalid request method.';
}

echo json_encode($response);
