const { z } = require('zod');

const markWatchedSchema = z.object({
    tmdbShowId: z.number().int().positive('Invalid show ID'),
    season: z.number().int().min(0, 'Invalid season number'),
    episode: z.number().int().positive('Invalid episode number'),
    episodeName: z.string().max(200).nullable().optional(),
    runtime: z.number().int().min(0).optional().default(0),
    airDate: z.string().nullable().optional(),
});

const markUnwatchedSchema = z.object({
    tmdbShowId: z.number().int().positive('Invalid show ID'),
    season: z.number().int().min(0, 'Invalid season number'),
    episode: z.number().int().positive('Invalid episode number'),
});

const markRewatchedSchema = z.object({
    tmdbShowId: z.number().int().positive('Invalid show ID'),
    season: z.number().int().min(0, 'Invalid season number'),
    episode: z.number().int().positive('Invalid episode number'),
});

module.exports = { markWatchedSchema, markUnwatchedSchema, markRewatchedSchema };
