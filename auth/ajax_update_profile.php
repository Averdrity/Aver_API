<?php
// ===========================================
// 👤 ajax_update_profile.php (v3.0)
// Secure profile information update (AJAX)
// ===========================================

header('Content-Type: application/json');
session_start();
require_once __DIR__ . '/../includes/db.php';

$response = ['success' => false, 'message' => ''];

// Check login
if (!isset($_SESSION['user_id'])) {
    $response['message'] = 'You must be logged in to update your profile.';
    echo json_encode($response);
    exit;
}

// Ensure POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['message'] = 'Invalid request method.';
    echo json_encode($response);
    exit;
}

// Parse and sanitize input
$input = json_decode(file_get_contents('php://input'), true);

$name    = isset($input['name'])    ? htmlspecialchars(trim($input['name']))    : '';
$country = isset($input['country']) ? htmlspecialchars(trim($input['country'])) : '';
$website = isset($input['website']) ? filter_var(trim($input['website']), FILTER_VALIDATE_URL) : null;
$bio     = isset($input['bio'])     ? htmlspecialchars(trim($input['bio']))     : '';

try {
    $stmt = $pdo->prepare("
    UPDATE users
    SET name = :name, country = :country, website = :website, bio = :bio
    WHERE id = :id
    ");

    $stmt->execute([
        ':name'    => $name,
        ':country' => $country,
        ':website' => $website,
        ':bio'     => $bio,
        ':id'      => $_SESSION['user_id']
    ]);

    $response['success'] = true;
    $response['message'] = 'Profile updated successfully.';

} catch (PDOException $e) {
    error_log("[Profile Update Error] " . $e->getMessage());
    $response['message'] = 'Server error while updating profile.';
}

echo json_encode($response);
