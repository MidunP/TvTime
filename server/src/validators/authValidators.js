const { z } = require('zod');

const registerSchema = z.object({
    username: z.string()
        .min(3, 'Username must be at least 3 characters')
        .max(30, 'Username must be at most 30 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .max(128, 'Password must be at most 128 characters'),
    displayName: z.string().max(50).optional(),
});

const loginSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
});

module.exports = { registerSchema, loginSchema };
