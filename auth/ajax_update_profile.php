<?php
// =============================================
// 💾 ajax_update_profile.php (v3.0)
// =============================================
// Handles user profile updates. Validates
// and sanitizes input, updates the database,
// and includes authentication checks.
// =============================================

session_start();
header("Content-Type: application/json");

require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/logger.php';
require_once __DIR__ . '/../includes/auth.php'; // Assuming auth functions are here

/**
 * Validates and sanitizes user profile update input.
 *
 * @param array $data The data received from the client.
 * @return array|false An array containing the validated input, or false if validation fails.
 */
function validateProfileUpdateInput(array $data): array|false {
    $validated =;

    $validated['name'] = filter_var(trim($data['name'] ?? ''), FILTER_SANITIZE_STRING);
    $validated['country'] = filter_var(trim($data['country'] ?? ''), FILTER_SANITIZE_STRING);
    $validated['website'] = filter_var(trim($data['website'] ?? ''), FILTER_SANITIZE_URL);
    $validated['bio'] = filter_var(trim($data['bio'] ?? ''), FILTER_SANITIZE_STRING);

    // Add more robust validation as needed (e.g., length restrictions)
    if ($validated['website'] && !$validated['website']) { // If website is provided, ensure it's a valid URL
        return false;
    }

    return $validated;
}

/**
 * Updates the user's profile information in the database.
 *
 * @param PDO   $pdo    The PDO database connection.
 * @param int   $userId The ID of the user.
 * @param array $data   An array containing the validated profile data.
 * @return bool True on success, false on error.
 */
function updateUserProfile(PDO $pdo, int $userId, array $data): bool {
    try {
        $stmt = $pdo->prepare("UPDATE users
        SET name=:name, country=:country, website=:website, bio=:bio
        WHERE id=:id");
        $stmt->execute([
            ':name' => $data['name'],
            ':country' => $data['country'],
            ':website' => $data['website'],
            ':bio' => $data['bio'],
            ':id' => $userId
        ]);
        return true;
    } catch (Exception $e) {
        log_to_db('php', 'error', "Database error updating profile: " . $e->getMessage(), 'ajax_update_profile.php');
        return false;
    }
}

/**
 * Handles the profile update process, including validation, authentication, and database update.
 *
 * @param PDO $pdo  The PDO database connection.
 * @param array $data The data received from the client.
 * @return void
 */
function handleProfileUpdate(PDO $pdo, array $data): void {
    $userId = get_user_id(); // Assuming this function gets the logged-in user's ID
    if (!$userId) {
        echo json_encode(["error" => "Not logged in"]);
        exit;
    }

    $validatedInput = validateProfileUpdateInput($data);
    if ($validatedInput === false) {
        echo json_encode(["error" => "Invalid input"]);
        exit;
    }

    if (!updateUserProfile($pdo, $userId, $validatedInput)) {
        echo json_encode(["error" => "Server error"]);
        exit;
    }

    log_to_file('php', "Profile updated: " . get_username($userId), 'ajax_update_profile.php'); // Assuming get_username function exists
    log_to_db('php', 'info', "Profile updated by user", 'ajax_update_profile.php');

    echo json_encode(["success" => true]);
}

// Main execution flow
try {
    $input = json_decode(file_get_contents("php://input"), true);
    if (!is_array($input)) {
        log_to_db('php', 'error', "Invalid request format", 'ajax_update_profile.php');
        echo json_encode(["error" => "Invalid request format"]);
        exit;
    }

    handleProfileUpdate($pdo, $input);

} catch (Exception $e) {
    log_to_file('php', "Profile update error: " . $e->getMessage(), 'ajax_update_profile.php');
    log_to_db('php', 'critical', $e->getMessage(), 'ajax_update_profile.php');
    echo json_encode(["error" => "Server error"]);
}
