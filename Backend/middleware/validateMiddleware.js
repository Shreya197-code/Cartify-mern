const { z } = require('zod');

const validate = (schema) => (req, res, next) => {
    try {
        if (schema.body) {
            req.body = schema.body.parse(req.body);
        }
        if (schema.query) {
            req.query = schema.query.parse(req.query);
        }
        if (schema.params) {
            req.params = schema.params.parse(req.params);
        }
        next();
    } catch (error) {
        if (error instanceof z.ZodError || error.name === 'ZodError') {
            const issues = error.issues || error.errors || [];
            const formattedErrors = issues.map(err => ({
                field: Array.isArray(err.path) ? err.path.join('.') : String(err.path || ''),
                message: err.message
            }));
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: formattedErrors
            });
        }
        next(error);
    }
};

module.exports = validate;
