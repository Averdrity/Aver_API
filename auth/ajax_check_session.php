<?php
// ==========================================
// 🔐 ajax_check_session.php (v3.0)
// ==========================================
// Checks if a user session is active and
// returns user information if available.
// Includes security considerations.
// ==========================================

session_start();
header("Content-Type: application/json");

/**
 * Checks if a user session is active and returns user information.
 *
 * @return void
 */
function checkUserSession(): void {
    if (isset($_SESSION['user_id']) && isset($_SESSION['username'])) {
        // Sanitize data retrieved from session
        $userId = filter_var($_SESSION['user_id'], FILTER_SANITIZE_NUMBER_INT);
        $username = filter_var($_SESSION['username'], FILTER_SANITIZE_STRING);

        echo json_encode([
            "logged_in" => true,
            "user_id"   => $userId,
            "username"  => $username
        ]);
    } else {
        echo json_encode(["logged_in" => false]);
    }
}

// Main execution flow
checkUserSession();

// Potential security enhancements (depending on your needs):
// - Session fixation prevention (if not already handled elsewhere, e.g., login):
//   session_regenerate_id(true);
// - Consider using session_status() === PHP_SESSION_ACTIVE for more explicit session check
// - Logging session check requests (especially failures) for auditing
