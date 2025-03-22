<?php
// =================================
// 🚪 logout.php (v3.0)
// =================================
// Handles user logout. Destroys the
// session and redirects to the
// homepage. Includes logging.
// =================================

session_start();
require_once __DIR__ . '/../includes/logger.php';

/**
 * Handles user logout, including logging and session destruction.
 *
 * @return void
 */
function handleLogout(): void {
    if (isset($_SESSION['username'])) {
        log_to_file('php', "User logged out: " . $_SESSION['username'], 'logout.php');
        log_to_db('php', 'info', "Logout: " . $_SESSION['username'], 'logout.php');
    }

    // Clear all session variables
    $_SESSION =;

    // Get session parameters
    $params = session_get_cookie_params();

    // Delete the actual cookie.
    setcookie(session_name(), '', time() - 42000,
              $params["path"], $params["domain"],
              $params["secure"], $params["httponly"]
    );

    // Destroy the session
    session_destroy();
}

// Main execution flow
handleLogout();

// Redirect user back to homepage or a logout confirmation page
header("Location: /index.html");
exit;
?>
