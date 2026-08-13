// Generic Zod validation middleware
// Usage: router.post('/route', validate(schema), handler)
// Also supports query/params validation via options
const validate = (schema, source = 'body') => (req, res, next) => {
    const data = source === 'body' ? req.body
        : source === 'query' ? req.query
            : req.params;

    const result = schema.safeParse(data);

    if (!result.success) {
        const errors = result.error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
        }));
        return res.status(400).json({
            message: errors[0].message,
            errors,
        });
    }

    // Replace with parsed + coerced data (strips unknown fields)
    if (source === 'body') req.body = result.data;
    else if (source === 'query') req.query = result.data;
    else req.params = result.data;

    next();
};

module.exports = validate;
