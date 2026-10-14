/**
 * Privacy-Preserving Minimal Request Logger
 * Ensures IP addresses, user agents, cookies, and sensitive payload data
 * are NEVER written to server log streams.
 */
export function privacyLogger(req, res, next) {
  const start = Date.now();
  const { method, path } = req;

  // Clean path - strip any sensitive query parameters
  const cleanPath = path.split('?')[0];

  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const level = status >= 500 ? 'ERROR' : status >= 400 ? 'WARN' : 'INFO';

    // Logs only minimal routing telemetry
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[${level}] ${method} ${cleanPath} -> ${status} (${duration}ms)`);
    }
  });

  next();
}
