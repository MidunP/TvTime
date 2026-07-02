const axios = require('axios');

const tmdb = axios.create({
  baseURL: process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3',
  params: { api_key: process.env.TMDB_API_KEY },
  timeout: 10000,
});

const tmdbService = {
  async searchShows(query, page = 1) {
    const res = await tmdb.get('/search/tv', { params: { query, page } });
    return res.data;
  },

  async getShow(tmdbId) {
    const res = await tmdb.get(`/tv/${tmdbId}`, {
      params: { append_to_response: 'credits,content_ratings,videos,external_ids' },
    });
    return res.data;
  },

  async getSeason(tmdbId, seasonNumber) {
    const res = await tmdb.get(`/tv/${tmdbId}/season/${seasonNumber}`);
    return res.data;
  },

  async getTrending() {
    const res = await tmdb.get('/trending/tv/week');
    return res.data;
  },

  async getPopular(page = 1) {
    const res = await tmdb.get('/tv/popular', { params: { page } });
    return res.data;
  },

  async getShowsByIds(ids) {
    const shows = await Promise.allSettled(
      ids.map((id) => tmdb.get(`/tv/${id}`).then((r) => r.data))
    );
    return shows
      .filter((r) => r.status === 'fulfilled')
      .map((r) => r.value);
  },
};

module.exports = tmdbService;
