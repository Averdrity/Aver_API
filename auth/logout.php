<?php
// File: /auth/logout.php

session_start();
require_once __DIR__ . '/../includes/logger.php';

if (isset($_SESSION['username'])) {
    log_to_file('php', "User logged out: {$_SESSION['username']}", 'logout.php');
    log_to_db('php', 'info', "Logout: {$_SESSION['username']}", 'logout.php');
}

// Destroy session
session_unset();
session_destroy();

// Optional: redirect user back to homepage
header("Location: /index.html");
exit;

