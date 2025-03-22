<?php
// =======================================
// 📝 ajax_register.php (v3.0)
// =======================================
// Handles user registration. Validates
// input, creates a new user account, and
// includes security enhancements.
// =======================================

header("Content-Type: application/json");

require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/logger.php';

/**
 * Validates and sanitizes user registration input.
 *
 * @param string $username The username to validate.
 * @param string $password The password to validate.
 * @return array|false An array containing the validated username and password, or false if validation fails.
 */
function validateRegistrationInput(string $username, string $password): array|false {
    $username = trim($username);
    $password = trim($password);

    if (empty($username) || empty($password)) {
        return false;
    }

    // Add more robust validation as needed (e.g., length restrictions, character restrictions, username format)
    if (strlen($username) < 4 || strlen($username) > 64) {
        return false;
    }

    if (strlen($password) < 8) {
        return false;
    }

    $username = filter_var($username, FILTER_SANITIZE_STRING); // Basic sanitization
    return ['username' => $username, 'password' => $password];
}

/**
 * Checks if a username already exists in the database.
 *
 * @param PDO    $pdo      The PDO database connection.
 * @param string $username The username to check.
 * @return bool True if the username exists, false otherwise.
 */
function usernameExists(PDO $pdo, string $username): bool {
    try {
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE username = :username");
        $stmt->execute([':username' => $username]);
        return (bool) $stmt->fetchColumn();
    } catch (Exception $e) {
        log_to_db('php', 'error', "Database error checking username: " . $e->getMessage(), 'ajax_register.php');
        return false;
    }
}

/**
 * Creates a new user account in the database.
 *
 * @param PDO    $pdo      The PDO database connection.
 * @param string $username The username for the new account.
 * @param string $password The hashed password for the new account.
 * @return bool True on success, false on error.
 */
function createUser(PDO $pdo, string $username, string $password): bool {
    try {
        $hash = password_hash($password, PASSWORD_BCRYPT);
        $stmt = $pdo->prepare("INSERT INTO users (username, password) VALUES (:username, :password)");
        $stmt->execute([':username' => $username, ':password' => $hash]);
        return true;
    } catch (Exception $e) {
        log_to_db('php', 'error', "Database error creating user: " . $e->getMessage(), 'ajax_register.php');
        return false;
    }
}

/**
 * Handles user registration, including validation, username availability check, account creation, and logging.
 *
 * @param PDO    $pdo      The PDO database connection.
 * @param string $username The username provided by the user.
 * @param string $password The password provided by the user.
 * @return void
 */
function handleRegistration(PDO $pdo, string $username, string $password): void {
    $validatedInput = validateRegistrationInput($username, $password);
    if ($validatedInput === false) {
        echo json_encode(["error" => "Invalid username or password"]);
        exit;
    }

    if (usernameExists($pdo, $validatedInput['username'])) {
        echo json_encode(["error" => "Username already taken"]);
        exit;
    }

    if (!createUser($pdo, $validatedInput['username'], $validatedInput['password'])) {
        echo json_encode(["error" => "Registration failed"]);
        exit;
    }

    // Optionally, you might want to start a session for the user after successful registration
    // session_start();
    // $_SESSION['user_id'] = $pdo->lastInsertId(); // Example: Get the new user's ID
    // $_SESSION['username'] = $validatedInput['username'];

    log_to_file('php', "User registered: {$validatedInput['username']}", 'ajax_register.php');
    log_to_db('php', 'info', "Registration: {$validatedInput['username']}", 'ajax_register.php');

    echo json_encode(["success" => true, "message" => "Registration successful"]);
}

// Main execution flow
try {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!is_array($data) || !isset($data['username']) || !isset($data['password'])) {
        log_to_db('php', 'error', "Invalid request format", 'ajax_register.php');
        echo json_encode(["error" => "Invalid request format"]);
        exit;
    }

    handleRegistration($pdo, $data['username'], $data['password']);

} catch (Exception $e) {
    log_to_file('php', "Registration error: " . $e->getMessage(), 'ajax_register.php');
    log_to_db('php', 'critical', $e->getMessage(), 'ajax_register.php');
    echo json_encode(["error" => "Server error"]);
}
