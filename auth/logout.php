<?php
// File: /auth/logout.php

session_start();
require_once __DIR__ . '/../includes/logger.php';

$username = isset($_SESSION['username']) ? $_SESSION['username'] : 'unknown';

if (isset($_SESSION['username'])) {
    log_to_file('php', "User logged out: $username", 'logout.php');
    log_to_db('php', 'info', "Logout: $username", 'logout.php');
}

// Destroy session securely
$_SESSION = [];
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
              $params["path"], $params["domain"],
              $params["secure"], $params["httponly"]
    );
}
session_destroy();

// Redirect to homepage (ensure clean exit)
header("Location: /index.html");
exit;
