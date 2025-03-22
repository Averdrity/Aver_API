<?php
// File: /includes/db.php

$DB_HOST = 'localhost';
$DB_NAME = 'aver_ai';
$DB_USER = 'root';
$DB_PASS = 'fhw8phnv2p';

// Global PDO instance
try {
    $pdo = new PDO("mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4", $DB_USER, $DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    // Log connection error
    $errorMsg = "[DB-CONNECT] " . $e->getMessage();
    file_put_contents(__DIR__ . '/../logs/php.log', date("[Y-m-d H:i:s] ") . $errorMsg . PHP_EOL, FILE_APPEND);

    // Optional: Also log into DB table `sql_logs` if available
    if (file_exists(__DIR__ . '/logger.php')) {
        require_once __DIR__ . '/logger.php';
        log_to_db('sql', 'critical', $errorMsg, 'db.php');
    }

    // Stop script if DB fails
    die("Database connection failed.");
}
?>

