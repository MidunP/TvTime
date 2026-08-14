// Cache Service — Redis-backed caching layer with in-memory fallback
// Accelerates hot reads for search, trending titles, user feeds, and session checks
const Redis = require('ioredis');
const env = require('../config/validateEnv');

class CacheService {
    constructor() {
        this.redis = null;
        this.isRedisReady = false;
        this.fallbackMap = new Map();
        this.fallbackTtls = new Map();

        if (env.REDIS_URL) {
            try {
                this.redis = new Redis(env.REDIS_URL, {
                    maxRetriesPerRequest: 1,
                    lazyConnect: true,
                    retryStrategy(times) {
                        if (times > 3) return null; // Stop retrying after 3 failed attempts
                        return Math.min(times * 200, 1000);
                    },
                    enableOfflineQueue: false,
                });

                this.redis.on('connect', () => {
                    this.isRedisReady = true;
                    console.log('⚡ Connected to Redis cache service');
                });

                this.redis.on('error', (err) => {
                    if (this.isRedisReady) {
                        console.warn('⚠️ Redis connection error, using in-memory fallback:', err.message);
                    }
                    this.isRedisReady = false;
                });

                // Attempt initial connection asynchronously
                this.redis.connect().catch((err) => {
                    console.warn('⚠️ Redis not available at startup, operating in fallback mode:', err.message);
                    this.isRedisReady = false;
                });
            } catch (e) {
                console.warn('⚠️ Redis initialization failed, using in-memory fallback:', e.message);
                this.isRedisReady = false;
            }
        }
    }

    async get(key) {
        if (this.isRedisReady && this.redis) {
            try {
                const val = await this.redis.get(key);
                return val ? JSON.parse(val) : null;
            } catch (err) {
                // Suppress & fallback
            }
        }
        // Fallback in-memory cache
        const expireTime = this.fallbackTtls.get(key);
        if (expireTime && Date.now() > expireTime) {
            this.del(key);
            return null;
        }
        return this.fallbackMap.get(key) || null;
    }

    async set(key, value, ttlSeconds = 300) {
        if (this.isRedisReady && this.redis) {
            try {
                const serialized = JSON.stringify(value);
                if (ttlSeconds > 0) {
                    await this.redis.set(key, serialized, 'EX', ttlSeconds);
                } else {
                    await this.redis.set(key, serialized);
                }
                return;
            } catch (err) {
                // Suppress & fallback
            }
        }
        // Fallback in-memory cache
        this.fallbackMap.set(key, value);
        if (ttlSeconds > 0) {
            this.fallbackTtls.set(key, Date.now() + ttlSeconds * 1000);
        }
    }

    async del(key) {
        if (this.isRedisReady && this.redis) {
            try {
                await this.redis.del(key);
            } catch (err) {
                // Suppress & fallback
            }
        }
        this.fallbackMap.delete(key);
        this.fallbackTtls.delete(key);
    }

    async getOrSet(key, fetchFn, ttlSeconds = 300) {
        const cached = await this.get(key);
        if (cached !== null) {
            return cached;
        }
        const freshData = await fetchFn();
        if (freshData !== undefined && freshData !== null) {
            await this.set(key, freshData, ttlSeconds);
        }
        return freshData;
    }

    async clear() {
        if (this.isRedisReady && this.redis) {
            try {
                await this.redis.flushdb();
            } catch (err) {
                // Suppress & fallback
            }
        }
        this.fallbackMap.clear();
        this.fallbackTtls.clear();
    }
}

module.exports = new CacheService();
