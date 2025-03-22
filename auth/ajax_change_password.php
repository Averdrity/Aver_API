<?php
// =============================================
// 🔒 ajax_change_password.php (v3.0)
// =============================================
// Handles user password changes. Verifies
// current password, validates new passwords,
// and updates the database. Includes security
// and authentication checks.
// =============================================

session_start();
header("Content-Type: application/json");

require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/logger.php';
require_once __DIR__ . '/../includes/auth.php'; // Assuming auth functions are here

/**
 * Validates and sanitizes the password change input.
 *
 * @param string $current The current password.
 * @param string $new     The new password.
 * @param string $confirm The password confirmation.
 * @return array|false An array containing the validated input, or false if validation fails.
 */
function validatePasswordChangeInput(string $current, string $new, string $confirm): array|false {
    $current = trim($current);
    $new = trim($new);
    $confirm = trim($confirm);

    if (empty($current) || empty($new) || empty($confirm)) {
        return false;
    }

    if ($new !== $confirm) {
        return false;
    }

    // Add more robust validation as needed (e.g., password complexity rules)
    if (strlen($new) < 8) { // Example: Minimum password length
        return false;
    }

    return ['current' => $current, 'new' => $new];
}

/**
 * Retrieves the user's current password hash from the database.
 *
 * @param PDO $pdo    The PDO database connection.
 * @param int $userId The ID of the user.
 * @return string|false The user's current password hash, or false on error.
 */
function getCurrentPasswordHash(PDO $pdo, int $userId): string|false {
    try {
        $stmt = $pdo->prepare("SELECT password FROM users WHERE id = :id");
        $stmt->execute([':id' => $userId]);
        $user = $stmt->fetch();
        return $user ? $user['password'] : false;
    } catch (Exception $e) {
        log_to_db('php', 'error', "Database error fetching current password: " . $e->getMessage(), 'ajax_change_password.php');
        return false;
    }
}

/**
 * Updates the user's password in the database.
 *
 * @param PDO    $pdo      The PDO database connection.
 * @param int    $userId   The ID of the user.
 * @param string $newHash  The new password hash.
 * @return bool True on success, false on error.
 */
function updatePassword(PDO $pdo, int $userId, string $newHash): bool {
    try {
        $stmt = $pdo->prepare("UPDATE users SET password=:pwd WHERE id=:id");
        $stmt->execute([':pwd' => $newHash, ':id' => $userId]);
        return true;
    } catch (Exception $e) {
        log_to_db('php', 'error', "Database error updating password: " . $e->getMessage(), 'ajax_change_password.php');
        return false;
    }
}

/**
 * Handles the password change process, including validation, authentication, and database update.
 *
 * @param PDO    $pdo     The PDO database connection.
 * @param string $current The current password provided by the user.
 * @param string $new     The new password provided by the user.
 * @param string $confirm The password confirmation provided by the user.
 * @return void
 */
function handlePasswordChange(PDO $pdo, string $current, string $new, string $confirm): void {
    $validatedInput = validatePasswordChangeInput($current, $new, $confirm);
    if ($validatedInput === false) {
        echo json_encode(["error" => "Invalid input"]);
        exit;
    }

    $userId = get_user_id(); // Assuming this function gets the logged-in user's ID
    if (!$userId) {
        echo json_encode(["error" => "Not logged in"]);
        exit;
    }

    $currentHash = getCurrentPasswordHash($pdo, $userId);
    if ($currentHash === false || !password_verify($validatedInput['current'], $currentHash)) {
        echo json_encode(["error" => "Incorrect current password"]);
        exit;
    }

    $newHash = password_hash($validatedInput['new'], PASSWORD_BCRYPT);
    if (!updatePassword($pdo, $userId, $newHash)) {
        echo json_encode(["error" => "Server error"]);
        exit;
    }

    log_to_file('php', "Password changed: " . get_username($userId), 'ajax_change_password.php'); // Assuming get_username function exists
    log_to_db('php', 'info', "User changed password", 'ajax_change_password.php');

    echo json_encode(["success" => true]);
}

// Main execution flow
try {
    $input = json_decode(file_get_contents("php://input"), true);
    if (!is_array($input) || !isset($input['current']) || !isset($input['new']) || !isset($input['confirm'])) {
        log_to_db('php', 'error', "Invalid request format", 'ajax_change_password.php');
        echo json_encode(["error" => "Invalid request format"]);
        exit;
    }

    handlePasswordChange($pdo, $input['current'], $input['new'], $input['confirm']);

} catch (Exception $e) {
    log_to_file('php', "Password change error: " . $e->getMessage(), 'ajax_change_password.php');
    log_to_db('php', 'critical', $e->getMessage(), 'ajax_change_password.php');
    echo json_encode(["error" => "Server error"]);
}
