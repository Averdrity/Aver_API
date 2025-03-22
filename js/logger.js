// ========================================
// 📝 logger.js (v2.0)
// ========================================
// Frontend Logging Utility
// Clear categorization & structured logging
// ========================================

export const Logger = {
    log: (message, ...args) => {
        console.log(`🟢 [LOG]: ${message}`, ...args);
        sendLogToServer('log', message, args);
    },
    info: (message, ...args) => {
        console.info(`🔵 [INFO]: ${message}`, ...args);
        sendLogToServer('info', message, args);
    },
    warn: (message, ...args) => {
        console.warn(`🟡 [WARN]: ${message}`, ...args);
        sendLogToServer('warn', message, args);
    },
    error: (message, ...args) => {
        console.error(`🔴 [ERROR]: ${message}`, ...args);
        sendLogToServer('error', message, args);
    },
    debug: (message, ...args) => {
        console.debug(`🟣 [DEBUG]: ${message}`, ...args);
        sendLogToServer('debug', message, args);
    }
};

// Send logs to server-side logger
function sendLogToServer(level, message, data) {
    fetch('/backend/ajax/ajax_logger.php', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            level: level,
            message: message,
            data: data,
            timestamp: new Date().toISOString()
        })
    }).catch(console.error);
}
