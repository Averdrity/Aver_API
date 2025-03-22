<?php
// ===========================================
// 🔐 ajax_change_password.php (v2.0)
// ===========================================
// Secure user password change handler (AJAX)
// ===========================================

header('Content-Type: application/json');
require_once '../includes/db.php';
session_start();

$response = ['success' => false, 'message' => ''];

if (!isset($_SESSION['user_id'])) {
    $response['message'] = 'You must be logged in to change your password.';
    exit(json_encode($response));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $input = json_decode(file_get_contents('php://input'), true);
    $oldPassword = trim($input['oldPassword'] ?? '');
    $newPassword = trim($input['newPassword'] ?? '');
    $confirmPassword = trim($input['confirmPassword'] ?? '');

    if (empty($oldPassword) || empty($newPassword) || empty($confirmPassword)) {
        $response['message'] = 'All password fields are required.';
        exit(json_encode($response));
    }

    if ($newPassword !== $confirmPassword) {
        $response['message'] = 'New passwords do not match.';
        exit(json_encode($response));
    }

    if (strlen($newPassword) < 6) {
        $response['message'] = 'New password must be at least 6 characters.';
        exit(json_encode($response));
    }

    try {
        // Fetch current password
        $stmt = $pdo->prepare("SELECT password FROM users WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user || !password_verify($oldPassword, $user['password'])) {
            $response['message'] = 'Old password is incorrect.';
            exit(json_encode($response));
        }

        // Update to new password
        $hashedNewPass = password_hash($newPassword, PASSWORD_DEFAULT);
        $updateStmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
        $updateStmt->execute([$hashedNewPass, $_SESSION['user_id']]);

        $response['success'] = true;
        $response['message'] = 'Password successfully updated.';

    } catch (PDOException $e) {
        error_log("Password Change Error: " . $e->getMessage());
        $response['message'] = 'Server error while updating password.';
    }
} else {
    $response['message'] = 'Invalid request method.';
}

echo json_encode($response);
