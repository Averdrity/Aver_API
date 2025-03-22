<?php
// File: /includes/logger.php

function log_to_db(string $type, string $severity, string $message, string $sourceFile = 'unknown.php'): void {
    global $pdo;

    $tableMap = [
        'sql'     => 'sql_logs',
        'js'      => 'js_logs',
        'php'     => 'error_log_entries',
        'css'     => 'error_log_entries',
        'html'    => 'error_log_entries',
        'json'    => 'error_log_entries',
        'python'  => 'error_log_entries',
    ];

    $table = $tableMap[$type] ?? 'error_log_entries';

    try {
        $stmt = $pdo->prepare("
        INSERT INTO $table (severity, message, file, created_at)
        VALUES (:severity, :message, :file, NOW())
        ");
        $stmt->execute([
            ':severity' => $severity,
            ':message'  => $message,
            ':file'     => $sourceFile
        ]);
    } catch (Exception $e) {
        file_put_contents(__DIR__ . "/../logs/logger-error.log",
                          date("[Y-m-d H:i:s] ") . "DB Logging Failed: " . $e->getMessage() . PHP_EOL,
                          FILE_APPEND
        );
    }
}

function log_to_file(string $type, string $message, string $sourceFile = 'unknown.php'): void {
    $logDir = __DIR__ . '/../logs/';
    if (!is_dir($logDir)) mkdir($logDir, 0755, true);

    $logFile = $logDir . strtolower($type) . '.log';
    $entry = date("[Y-m-d H:i:s] ") . "[{$sourceFile}] {$message}" . PHP_EOL;

    file_put_contents($logFile, $entry, FILE_APPEND);
}
?>

