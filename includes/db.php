<?php
// ====================================
// 🗄️ db.php (v3.0)
// ====================================
// Establishes a PDO connection to the
// MySQL database. Handles configuration
// and connection errors.
// ====================================

/**
 * Establishes a PDO connection to the MySQL database.
 *
 * @return PDO|null PDO instance on success, null on failure.
 */
function connectToDB(): ?PDO {
    // Configuration (Load from environment variables or a config file)
    $db_host = $_ENV['DB_HOST'] ?? 'localhost';
    $db_name = $_ENV['DB_NAME'] ?? 'aver_ai';
    $db_user = $_ENV['DB_USER'] ?? 'root';
    $db_pass = $_ENV['DB_PASS'] ?? 'fhw8phnv2p';
    $db_charset = $_ENV['DB_CHARSET'] ?? 'utf8mb4';

    $dsn = "mysql:host=$db_host;dbname=$db_name;charset=$db_charset";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_PERSISTENT => $_ENV['DB_PERSISTENT'] ?? false, // Optional: Persistent connections
    ];

    try {
        $pdo = new PDO($dsn, $db_user, $db_pass, $options);
        return $pdo;
    } catch (PDOException $e) {
        $errorMsg = "[DB-CONNECT] " . $e->getMessage();
        error_log($errorMsg, 0); // Log to server error log
        // Optionally log to a file (ensure directory exists and is writable)
        $logFile = __DIR__ . '/../logs/php.log';
        if (is_writable(dirname($logFile))) {
            file_put_contents($logFile, date("[Y-m-d H:i:s] ") . $errorMsg . PHP_EOL, FILE_APPEND);
        }

        // Optionally log to DB (if logger is available)
        if (file_exists(__DIR__ . '/logger.php')) {
            require_once __DIR__ . '/logger.php';
            log_to_db('sql', 'critical', $errorMsg, 'db.php');
        }

        // Instead of die(), you might want to handle this more gracefully
        // depending on your application's needs. For example:
        // - Throw an exception
        // - Redirect to an error page
        // - Display a user-friendly error message
        return null; // Indicate failure
    }
}

// Global PDO instance (using a self-invoking function)
$pdo = (function () {
    $db = connectToDB();
    if (!$db) {
        // Handle the database connection failure.
        // This is a basic example; adjust based on your application.
        echo "Database connection failed. Please try again later.";
        exit;
    }
    return $db;
})();
