import api from './api';
import { checkBackend } from './authService';
import { mockShowService } from './mockShowService';

export const showService = {
  async addShow(showData) {
    if (await checkBackend()) {
      try {
        const { data } = await api.post('/shows/add', showData);
        return data.item;
      } catch (err) {
        if (!err.response) return mockShowService.addShow(showData);
        throw err;
      }
    }
    return mockShowService.addShow(showData);
  },

  async getWatchlist(status = null) {
    if (await checkBackend()) {
      try {
        const params = status ? { status } : {};
        const { data } = await api.get('/shows/watchlist', { params });
        return data.items;
      } catch (err) {
        if (!err.response) return mockShowService.getWatchlist(status);
        throw err;
      }
    }
    return mockShowService.getWatchlist(status);
  },

  async getShow(tmdbId) {
    if (await checkBackend()) {
      try {
        const { data } = await api.get(`/shows/${tmdbId}`);
        return data.item;
      } catch (err) {
        if (!err.response || err.response.status === 404) return mockShowService.getShow(tmdbId);
        throw err;
      }
    }
    return mockShowService.getShow(tmdbId);
  },

  async updateStatus(tmdbId, updates) {
    if (await checkBackend()) {
      try {
        const { data } = await api.put(`/shows/${tmdbId}/status`, updates);
        return data.item;
      } catch (err) {
        if (!err.response) return mockShowService.updateStatus(tmdbId, updates);
        throw err;
      }
    }
    return mockShowService.updateStatus(tmdbId, updates);
  },

  async removeShow(tmdbId) {
    if (await checkBackend()) {
      try {
        await api.delete(`/shows/${tmdbId}`);
        return;
      } catch (err) {
        if (!err.response) return mockShowService.removeShow(tmdbId);
        throw err;
      }
    }
    return mockShowService.removeShow(tmdbId);
  },

  async getProgress(tmdbId) {
    if (await checkBackend()) {
      try {
        const { data } = await api.get(`/shows/${tmdbId}/progress`);
        return data;
      } catch (err) {
        if (!err.response) return mockShowService.getProgress(tmdbId);
        throw err;
      }
    }
    return mockShowService.getProgress(tmdbId);
  },

  // Episodes
  async markWatched(episodeData) {
    if (await checkBackend()) {
      try {
        const { data } = await api.post('/episodes/watch', episodeData);
        return data;
      } catch (err) {
        if (!err.response) return mockShowService.markWatched(episodeData);
        throw err;
      }
    }
    return mockShowService.markWatched(episodeData);
  },

  async markUnwatched(episodeData) {
    if (await checkBackend()) {
      try {
        const { data } = await api.delete('/episodes/unwatch', { data: episodeData });
        return data;
      } catch (err) {
        if (!err.response) return mockShowService.markUnwatched(episodeData);
        throw err;
      }
    }
    return mockShowService.markUnwatched(episodeData);
  },

  async markRewatched(episodeData) {
    if (await checkBackend()) {
      try {
        const { data } = await api.post('/episodes/rewatch', episodeData);
        return data;
      } catch (err) {
        if (!err.response) return mockShowService.markRewatched(episodeData);
        throw err;
      }
    }
    return mockShowService.markRewatched(episodeData);
  },

  async getRecentEpisodes() {
    if (await checkBackend()) {
      try {
        const { data } = await api.get('/episodes/recent');
        return data.episodes;
      } catch (err) {
        if (!err.response) return [];
        throw err;
      }
    }
    return [];
  },

  // TMDb proxy
  async searchShows(query, page = 1) {
    if (await checkBackend()) {
      try {
        const { data } = await api.get('/tmdb/search', { params: { q: query, page } });
        return data;
      } catch (err) {
        if (!err.response || err.response.status >= 500) return mockShowService.searchShows(query);
        throw err;
      }
    }
    return mockShowService.searchShows(query);
  },

  async getTmdbShow(tmdbId) {
    if (await checkBackend()) {
      try {
        const { data } = await api.get(`/tmdb/show/${tmdbId}`);
        return data;
      } catch (err) {
        if (!err.response || err.response.status >= 500) return mockShowService.getTmdbShow(tmdbId);
        throw err;
      }
    }
    return mockShowService.getTmdbShow(tmdbId);
  },

  async getTmdbSeason(tmdbId, season) {
    if (await checkBackend()) {
      try {
        const { data } = await api.get(`/tmdb/show/${tmdbId}/season/${season}`);
        return data;
      } catch (err) {
        if (!err.response || err.response.status >= 500) return mockShowService.getTmdbSeason(tmdbId, season);
        throw err;
      }
    }
    return mockShowService.getTmdbSeason(tmdbId, season);
  },

  async getTrending() {
    if (await checkBackend()) {
      try {
        const { data } = await api.get('/tmdb/trending');
        return data;
      } catch (err) {
        if (!err.response || err.response.status >= 500) return mockShowService.getTrending();
        throw err;
      }
    }
    return mockShowService.getTrending();
  },

  async getStats() {
    if (await checkBackend()) {
      try {
        const { data } = await api.get('/stats');
        return data;
      } catch (err) {
        if (!err.response) return mockShowService.getStats();
        throw err;
      }
    }
    return mockShowService.getStats();
  },
};
