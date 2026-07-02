import api from './api';

export const showService = {
  async addShow(showData) {
    const { data } = await api.post('/shows/add', showData);
    return data.item;
  },

  async getWatchlist(status = null) {
    const params = status ? { status } : {};
    const { data } = await api.get('/shows/watchlist', { params });
    return data.items;
  },

  async getShow(tmdbId) {
    const { data } = await api.get(`/shows/${tmdbId}`);
    return data.item;
  },

  async updateStatus(tmdbId, updates) {
    const { data } = await api.put(`/shows/${tmdbId}/status`, updates);
    return data.item;
  },

  async removeShow(tmdbId) {
    await api.delete(`/shows/${tmdbId}`);
  },

  async getProgress(tmdbId) {
    const { data } = await api.get(`/shows/${tmdbId}/progress`);
    return data;
  },

  // Episodes
  async markWatched(episodeData) {
    const { data } = await api.post('/episodes/watch', episodeData);
    return data;
  },

  async markUnwatched(episodeData) {
    const { data } = await api.delete('/episodes/unwatch', { data: episodeData });
    return data;
  },

  async markRewatched(episodeData) {
    const { data } = await api.post('/episodes/rewatch', episodeData);
    return data;
  },

  async getRecentEpisodes() {
    const { data } = await api.get('/episodes/recent');
    return data.episodes;
  },

  // TMDb proxy
  async searchShows(query, page = 1) {
    const { data } = await api.get('/tmdb/search', { params: { q: query, page } });
    return data;
  },

  async getTmdbShow(tmdbId) {
    const { data } = await api.get(`/tmdb/show/${tmdbId}`);
    return data;
  },

  async getTmdbSeason(tmdbId, season) {
    const { data } = await api.get(`/tmdb/show/${tmdbId}/season/${season}`);
    return data;
  },

  async getTrending() {
    const { data } = await api.get('/tmdb/trending');
    return data;
  },
};
