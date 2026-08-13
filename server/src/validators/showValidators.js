const { z } = require('zod');

const addShowSchema = z.object({
    tmdbShowId: z.number().int().positive('Invalid show ID'),
    showTitle: z.string().min(1, 'Show title is required').max(200),
    showPoster: z.string().nullable().optional(),
    showBackdrop: z.string().nullable().optional(),
    showYear: z.string().nullable().optional(),
    totalEpisodes: z.number().int().min(0).optional().default(0),
    totalSeasons: z.number().int().min(0).optional().default(0),
    genres: z.array(z.string()).optional().default([]),
    networks: z.array(z.string()).optional().default([]),
});

const updateStatusSchema = z.object({
    status: z.enum(['watching', 'watchlist', 'completed', 'dropped', 'paused']).optional(),
    isFavorite: z.boolean().optional(),
    userRating: z.number().int().min(1).max(10).nullable().optional(),
    notes: z.string().max(500).nullable().optional(),
}).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field is required' }
);

module.exports = { addShowSchema, updateStatusSchema };
