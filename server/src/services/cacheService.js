// Cache Service — in-memory TTL caching layer with Redis-compatible interface
// Accelerates hot reads for search, trending titles, user feeds, and session checks

class CacheService {
    constructor() {
        this.cache = new Map();
        this.ttls = new Map();
    }

    get(key) {
        const expireTime = this.ttls.get(key);
        if (expireTime && Date.now() > expireTime) {
            this.del(key);
            return null;
        }
        return this.cache.get(key) || null;
    }

    set(key, value, ttlSeconds = 300) {
        this.cache.set(key, value);
        if (ttlSeconds > 0) {
            this.ttls.set(key, Date.now() + ttlSeconds * 1000);
        }
    }

    del(key) {
        this.cache.delete(key);
        this.ttls.delete(key);
    }

    async getOrSet(key, fetchFn, ttlSeconds = 300) {
        const cached = this.get(key);
        if (cached !== null) {
            return cached;
        }
        const freshData = await fetchFn();
        if (freshData !== undefined && freshData !== null) {
            this.set(key, freshData, ttlSeconds);
        }
        return freshData;
    }

    clear() {
        this.cache.clear();
        this.ttls.clear();
    }
}

module.exports = new CacheService();
