// File: /js/logger.js

// Call this from anywhere: logJS('error', 'Something failed here', 'chat.js')
export function logJS(severity = 'info', message = '', file = 'unknown.js', type = 'js') {
    try {
        fetch('/backend/ajax/ajax_logger.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ severity, message, file, type })
        });
    } catch (e) {
        console.warn('Logger failed:', e);
    }
}

// Auto-capture global JS errors
window.onerror = function (msg, src, line, col, error) {
    const message = `${msg} at ${src}:${line}:${col}`;
    logJS('error', message, src || 'unknown.js');
};

// Optional: Catch unhandled promise rejections
window.addEventListener('unhandledrejection', function (e) {
    const message = `Promise rejection: ${e.reason}`;
    logJS('error', message, 'unhandled-promise');
});

