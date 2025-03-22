<?php
// =======================================
// 👤 ajax_get_profile.php (v3.0)
// =======================================
// Retrieves user profile information.
// Requires authentication and handles
// potential errors.
// =======================================

session_start();
header("Content-Type: application/json");

require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/logger.php';
require_once __DIR__ . '/../includes/auth.php'; // Assuming auth functions are here

/**
 * Retrieves the user's profile information from the database.
 *
 * @param PDO $pdo    The PDO database connection.
 * @param int $userId The ID of the user.
 * @return array|false An array containing the user's profile information, or false on error.
 */
function getUserProfile(PDO $pdo, int $userId): array|false {
    try {
        $stmt = $pdo->prepare("SELECT name, country, website, bio FROM users WHERE id = :uid LIMIT 1");
        $stmt->execute([':uid' => $userId]);
        $profile = $stmt->fetch();
        return $profile ?: false;
    } catch (Exception $e) {
        log_to_db('php', 'error', "Database error fetching profile: " . $e->getMessage(), 'ajax_get_profile.php');
        return false;
    }
}

/**
 * Handles the retrieval of the user's profile.
 *
 * @param PDO $pdo The PDO database connection.
 * @return void
 */
function handleGetProfile(PDO $pdo): void {
    $userId = get_user_id(); // Assuming this function gets the logged-in user's ID
    if (!$userId) {
        echo json_encode(["error" => "Not logged in"]);
        exit;
    }

    $profile = getUserProfile($pdo, $userId);
    if ($profile === false) {
        echo json_encode(["error" => "Server error"]);
        exit;
    }

    // Sanitize or format profile data if needed
    // $profile['name'] = htmlspecialchars($profile['name']); // Example

    echo json_encode(["profile" => $profile]);
}

// Main execution flow
try {
    handleGetProfile($pdo);

} catch (Exception $e) {
    log_to_file('php', "Get profile error: " . $e->getMessage(), 'ajax_get_profile.php');
    log_to_db('php', 'critical', $e->getMessage(), 'ajax_get_profile.php');
    echo json_encode(["error" => "Server error"]);
}
