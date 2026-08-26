/**
 * Async handler wrapper to catch errors in Express routes and pass to error middleware
 * @param {Function} fn - Async express route handler function
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
