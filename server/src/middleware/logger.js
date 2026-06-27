const morgan = require('morgan');

/**
 * HTTP Request Logger (Morgan)
 *
 * Uses the 'dev' format in development for colorized, concise output.
 * Uses 'combined' (Apache format) in production for structured log lines.
 *
 * Output examples:
 *  dev:      POST /api/auth/login 200 12.345 ms - 156
 *  combined: 127.0.0.1 - [20/Jun/2026:14:00:00 +0000] "POST /api/auth/login HTTP/1.1" 200 156
 */
const logger = morgan(
  process.env.NODE_ENV === 'production' ? 'combined' : 'dev'
);

module.exports = logger;
