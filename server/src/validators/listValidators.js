const { z } = require('zod');

const createListSchema = z.object({
    name: z.string().min(1, 'List name is required').max(50),
    emoji: z.string().max(10).optional().default('📺'),
    description: z.string().max(200).nullable().optional(),
    isPrivate: z.boolean().optional().default(false),
});

const updateListSchema = z.object({
    name: z.string().min(1).max(50).optional(),
    emoji: z.string().max(10).optional(),
    description: z.string().max(200).nullable().optional(),
    isPrivate: z.boolean().optional(),
    sortOrder: z.number().int().min(0).optional(),
}).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field is required' }
);

const addShowToListSchema = z.object({
    tmdbShowId: z.number().int().positive('Invalid show ID'),
    posterUrl: z.string().nullable().optional(),
});

const reorderShowsSchema = z.object({
    showIds: z.array(z.number().int().positive()).min(1, 'Show IDs array is required'),
});

module.exports = { createListSchema, updateListSchema, addShowToListSchema, reorderShowsSchema };
