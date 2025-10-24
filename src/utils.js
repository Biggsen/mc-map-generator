import crypto from 'crypto';

/**
 * Generate a unique job ID for map generation requests
 * @param {string} seed - The Minecraft seed
 * @param {string} dimension - The dimension (overworld, nether, end)
 * @returns {string} Unique job ID
 */
export function generateJobId(seed, dimension) {
  const timestamp = Date.now();
  return `seed-${seed}-${dimension}-${timestamp}`;
}

/**
 * Validate seed input
 * @param {any} seed - The seed to validate
 * @returns {boolean} True if valid seed
 */
export function isValidSeed(seed) {
  if (typeof seed === 'string' && seed.trim().length > 0) {
    return true;
  }
  if (typeof seed === 'number' && !isNaN(seed)) {
    return true;
  }
  return false;
}

/**
 * Validate dimension input
 * @param {string} dimension - The dimension to validate
 * @returns {boolean} True if valid dimension
 */
export function isValidDimension(dimension) {
  const validDimensions = ['overworld', 'nether', 'end'];
  return validDimensions.includes(dimension?.toLowerCase());
}

/**
 * Normalize dimension name
 * @param {string} dimension - The dimension to normalize
 * @returns {string} Normalized dimension name
 */
export function normalizeDimension(dimension) {
  return dimension?.toLowerCase() || 'overworld';
}

/**
 * Validate size input
 * @param {number} size - The size to validate (2-16)
 * @returns {boolean} True if valid size
 */
export function isValidSize(size) {
  const numSize = parseInt(size);
  return !isNaN(numSize) && numSize >= 2 && numSize <= 16;
}

/**
 * Create structured log entry
 * @param {string} level - Log level (info, error, warn, debug)
 * @param {string} message - Log message
 * @param {Object} metadata - Additional metadata
 * @returns {Object} Structured log entry
 */
export function createLogEntry(level, message, metadata = {}) {
  return {
    timestamp: new Date().toISOString(),
    level,
    service: 'mc-map-generator',
    message,
    ...metadata
  };
}

/**
 * Log info message
 * @param {string} message - Log message
 * @param {Object} metadata - Additional metadata
 */
export function logInfo(message, metadata = {}) {
  const logEntry = createLogEntry('info', message, metadata);
  console.log(JSON.stringify(logEntry));
}

/**
 * Log error message
 * @param {string} message - Log message
 * @param {Object} metadata - Additional metadata
 */
export function logError(message, metadata = {}) {
  const logEntry = createLogEntry('error', message, metadata);
  console.error(JSON.stringify(logEntry));
}

/**
 * Log warning message
 * @param {string} message - Log message
 * @param {Object} metadata - Additional metadata
 */
export function logWarn(message, metadata = {}) {
  const logEntry = createLogEntry('warn', message, metadata);
  console.warn(JSON.stringify(logEntry));
}

/**
 * Create error response object
 * @param {string} error - Error code
 * @param {string} message - Error message
 * @param {string} jobId - Job ID (optional)
 * @param {boolean} retryable - Whether the error is retryable
 * @returns {Object} Error response object
 */
export function createErrorResponse(error, message, jobId = null, retryable = false) {
  return {
    success: false,
    error,
    message,
    jobId,
    retryable
  };
}

/**
 * Create success response object
 * @param {Object} data - Response data
 * @returns {Object} Success response object
 */
export function createSuccessResponse(data) {
  return {
    success: true,
    ...data
  };
}

/**
 * Format file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Generate random string for temporary files
 * @param {number} length - Length of random string
 * @returns {string} Random string
 */
export function generateRandomString(length = 8) {
  return crypto.randomBytes(length).toString('hex');
}
