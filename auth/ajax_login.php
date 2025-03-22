<?php
// ====================================
// 🔑 ajax_login.php (v3.0)
// ====================================
// Handles user login authentication.
// Verifies credentials, sets up session,
// and includes security enhancements.
// ====================================

session_start();
header("Content-Type: application/json");

require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/logger.php';

/**
 * Validates and sanitizes user input.
 *
 * @param string $username The username to validate.
 * @param string $password The password to validate.
 * @return array|false An array containing the validated username and password, or false if validation fails.
 */
function validateLoginInput(string $username, string $password): array|false {
    $username = trim($username);
    $password = trim($password);

    if (empty($username) || empty($password)) {
        return false;
    }

    // Add more robust validation as needed (e.g., length restrictions, character restrictions)
    $username = filter_var($username, FILTER_SANITIZE_STRING); // Basic sanitization
    return ['username' => $username, 'password' => $password];
}

/**
 * Retrieves user data from the database based on the provided username.
 *
 * @param PDO    $pdo      The PDO database connection.
 * @param string $username The username to search for.
 * @return array|false An array containing the user data, or false if the user is not found or an error occurs.
 */
function getUserData(PDO $pdo, string $username): array|false {
    try {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = :username LIMIT 1");
        $stmt->execute([':username' => $username]);
        $user = $stmt->fetch();
        return $user ?: false;
    } catch (Exception $e) {
        log_to_db('php', 'error', "Database error fetching user: " . $e->getMessage(), 'ajax_login.php');
        return false;
    }
}

/**
 * Verifies the provided password against the stored password hash.
 *
 * @param string $password        The password to verify.
 * @param string $hashedPassword The stored password hash.
 * @return bool True if the password matches, false otherwise.
 */
function verifyPassword(string $password, string $hashedPassword): bool {
    return password_verify($password, $hashedPassword);
}

/**
 * Handles user login, including validation, authentication, session setup, and logging.
 *
 * @param PDO    $pdo      The PDO database connection.
 * @param string $username The username provided by the user.
 * @param string $password The password provided by the user.
 * @return void
 */
function handleLogin(PDO $pdo, string $username, string $password): void {
    $validatedInput = validateLoginInput($username, $password);
    if ($validatedInput === false) {
        log_to_db('php', 'warning', "Invalid login input: $username", 'ajax_login.php');
        echo json_encode(["error" => "Invalid username or password."]);
        exit;
    }

    $user = getUserData($pdo, $validatedInput['username']);
    if ($user === false) {
        log_to_db('php', 'warning', "Login failed for: {$validatedInput['username']} - User not found", 'ajax_login.php');
        echo json_encode(["error" => "Invalid username or password."]);
        exit;
    }

    if (!verifyPassword($validatedInput['password'], $user['password'])) {
        // Introduce a small delay to mitigate timing attacks (more robust solutions might be needed)
        usleep(rand(50000, 150000)); // 50ms to 150ms
        log_to_db('php', 'warning', "Login failed for: {$validatedInput['username']} - Incorrect password", 'ajax_login.php');
        echo json_encode(["error" => "Invalid username or password."]);
        exit;
    }

    // Regenerate session ID to prevent session fixation
    session_regenerate_id(true);

    // Set session variables
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];

    // Consider storing additional user data in the session if needed
    // $_SESSION['user_role'] = $user['role']; // Example

    log_to_file('php', "User logged in: {$validatedInput['username']}", 'ajax_login.php');
    log_to_db('php', 'info', "Login: {$validatedInput['username']}", 'ajax_login.php');

    echo json_encode(["success" => true, "username" => $validatedInput['username']]);
}

// Main execution flow
try {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!is_array($data) || !isset($data['username']) || !isset($data['password'])) {
        log_to_db('php', 'error', "Invalid request format", 'ajax_login.php');
        echo json_encode(["error" => "Invalid request format"]);
        exit;
    }

    handleLogin($pdo, $data['username'], $data['password']);

} catch (Exception $e) {
    log_to_file('php', "Login error: " . $e->getMessage(), 'ajax_login.php');
    log_to_db('php', 'critical', $e->getMessage(), 'ajax_login.php');
    echo json_encode(["error" => "Server error"]);
}
