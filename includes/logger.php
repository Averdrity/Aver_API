<?php
// ====================================
// 🪓 logger.php (v3.0)
// ====================================
// Logging class for file and database
// logging. Supports levels, flexible
// formatting, and error handling.
// ====================================

require_once __DIR__ . '/db.php'; // Assuming db.php handles the database connection

class Logger {
    private string $logFile;
    private bool $logToDb;
    private PDO $pdo; // PDO instance

    /**
     * Constructor.
     *
     * @param array $config Logging configuration.
     */
    public function __construct(array $config =) {
        // Load configuration (from file, environment, etc.)
        $this->logFile = $config['log_file'] ?? $_ENV['LOG_FILE'] ?? __DIR__ . '/../logs/php.log';
        $this->logToDb = $config['log_to_db'] ?? ($_ENV['LOG_TO_DB'] ?? false) === true;
        $this->pdo = $GLOBALS['pdo'] ?? null; // Use the global PDO instance

        // Ensure log directory exists
        if (!is_dir(dirname($this->logFile))) {
            mkdir(dirname($this->logFile), 0777, true); // Create directories recursively
        }
    }

    /**
     * Logs a message.
     *
     * @param string $type     Log type (e.g., 'php', 'js', 'sql').
     * @param string $message  Log message.
     * @param string $source   Source file or context.
     * @param string $level    Log level (e.g., 'info', 'warn', 'error').
     * @param array  $context  Additional data to log.
     * @return void
     */
    public function log(string $type, string $message, string $source = 'unknown', string $level = 'info', array $context =): void {
        $timestamp = date("Y-m-d H:i:s");
        $logEntry = [
            'time' => $timestamp,
            'level' => $level,
            'type' => $type,
            'source' => $source,
            'message' => $message,
            'context' => $context,
        ];

        $this->logToFile($logEntry);
        if ($this->logToDb) {
            $this->logToDatabase($logEntry);
        }
    }

    /**
     * Logs a message to a file.
     *
     * @param array $logEntry Log entry array.
     * @return void
     */
    private function logToFile(array $logEntry): void {
        $logMessage = json_encode($logEntry) . PHP_EOL; // Log as JSON
        try {
            if (is_writable(dirname($this->logFile))) {
                file_put_contents($this->logFile, $logMessage, FILE_APPEND);
            } else {
                error_log("Cannot write to log file: " . $this->logFile, 0); // Log to server error log
            }
        } catch (Exception $e) {
            error_log("File logging failed: " . $e->getMessage(), 0);
        }
    }

    /**
     * Logs a message to the database.
     *
     * @param array $logEntry Log entry array.
     * @return void
     */
    private function logToDatabase(array $logEntry): void {
        if (!$this->pdo) {
            error_log("Cannot log to DB: No PDO instance available", 0);
            return;
        }

        try {
            $stmt = $this->pdo->prepare("
            INSERT INTO logs (level, type, source, message, context, created_at)
            VALUES (:level, :type, :source, :message, :context, NOW())
            ");
            $context = json_encode($logEntry['context']); // Store context as JSON
            $stmt->execute([
                ':level' => $logEntry['level'],
                ':type' => $logEntry['type'],
                ':source' => $logEntry['source'],
                ':message' => $logEntry['message'],
                ':context' => $context,
            ]);
        } catch (Exception $e) {
            error_log("DB logging failed: " . $e->getMessage(), 0);
        }
    }
}

// Example Usage (You might adjust this based on your needs)
// $logger = new Logger(['log_to_db' => true]); // Example with DB logging enabled
$logger = new Logger(); // Use default settings

// The old functions, now using the class
function log_to_file(string $type, string $message, string $file = 'unknown.php', string $level = 'info', array $context =) {
    global $logger;
    $logger->log($type, $message, $file, $level, $context);
}

function log_to_db(string $type, string $level, string $message, string $file = 'unknown.php', array $context =) {
    global $logger;
    $logger->log($type, $message, $file, $level, $context);
}
