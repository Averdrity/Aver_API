// ========================================
// 📝 logger.js (v3.0)
// ========================================
// Client-side logging module with queueing,
// levels, and improved error handling.
// ========================================

class Logger {
    constructor(options = {}) {
        this.options = {
            level: options.level || 'info', // Default log level
            logToConsole: options.logToConsole || false, // Log to console?
            batchSize: options.batchSize || 10, // How many logs to send at once
            queue:[],
            ...options,
        };
    }

    // Log levels (can be customized)
    static levels = {
        debug: 0,
        info: 1,
        warn: 2,
        error: 3,
    };

    log(level, message, context = {}) {
        if (Logger.levels[level] === undefined) {
            console.error(`Invalid log level: ${level}`);
            return;
        }

        if (Logger.levels[level] < Logger.levels[this.options.level]) {
            return; // Don't log if below current level
        }

        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message: this.sanitize(message),
            context,
        };

        if (this.options.logToConsole) {
            this.consoleLog(level, message, context, timestamp);
        }

        this.queueLog(logEntry);
        this.processQueue();
    }

    // Shorthand methods for each log level
    debug(message, context) {
        this.log('debug', message, context);
    }

    info(message, context) {
        this.log('info', message, context);
    }

    warn(message, context) {
        this.log('warn', message, context);
    }

    error(message, context) {
        this.log('error', message, context);
    }

    consoleLog(level, message, context, timestamp) {
        const logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        switch (level) {
            case 'error':
                console.error(logMessage, context);
                break;
            case 'warn':
                console.warn(logMessage, context);
                break;
            case 'info':
                console.info(logMessage, context);
                break;
            default:
                console.debug(logMessage, context);
        }
    }

    queueLog(logEntry) {
        this.options.queue.push(logEntry);
    }

    async processQueue() {
        if (this.options.queue.length >= this.options.batchSize) {
            const batch = this.options.queue.splice(0, this.options.batchSize);
            await this.sendLogs(batch);
        }
    }

    async sendLogs(logs) {
        try {
            const res = await fetch('/backend/ajax/ajax_logger.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ logs }),
            });

            if (!res.ok) {
                throw new Error(`Logging failed with status: ${res.status}`);
            }

            const data = await res.json();
            if (data.status !== 'success') {
                throw new Error(`Logging failed: ${data.message}`);
            }

        } catch (error) {
            console.error('Error sending logs:', error);
            // Re-queue logs if sending fails (simple retry)
            this.options.queue.unshift(...logs);
        }
    }

    sanitize(text) {
        if (typeof text !== 'string') return text;
        return text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
}

// Example Usage (You might adjust this based on your needs)
const logger = new Logger({
    level: 'debug',
    logToConsole: true,
    batchSize: 5,
});

// Export the logger instance (or the class if you need multiple instances)
export default logger;
