const axios = require('axios');
const CircuitBreaker = require('opossum');

// USE_MOCK=true forces mock data regardless of whether TMDB_API_KEY is set
const useMock = process.env.USE_MOCK === 'true';
const tmdbKey = !useMock && process.env.TMDB_API_KEY && process.env.TMDB_API_KEY !== 'your_tmdb_api_key_here'
  ? process.env.TMDB_API_KEY
  : null;

const tmdb = tmdbKey
  ? axios.create({
    baseURL: process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3',
    params: { api_key: tmdbKey },
    timeout: 5000,
  })
  : null;

const MOCK_BACKEND_SHOWS = [
  {
    id: 1396,
    name: 'Breaking Bad',
    title: 'Breaking Bad',
    poster_path: '/zneScBx68wS2u3e6oi2iW9D07.jpg',
    backdrop_path: '/tsRy63MuZvE8yOfuKog5iBvF3oW.jpg',
    first_air_date: '2008-01-20',
    number_of_seasons: 5,
    number_of_episodes: 62,
    vote_average: 8.9,
    vote_count: 14500,
    status: 'Ended',
    overview: 'A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine.',
    genres: [{ id: 18, name: 'Drama' }, { id: 80, name: 'Crime' }],
    networks: [{ name: 'AMC' }],
    seasons: [
      { season_number: 1, episode_count: 7, name: 'Season 1' },
      { season_number: 2, episode_count: 13, name: 'Season 2' },
      { season_number: 3, episode_count: 13, name: 'Season 3' },
      { season_number: 4, episode_count: 13, name: 'Season 4' },
      { season_number: 5, episode_count: 16, name: 'Season 5' },
    ],
  },
  {
    id: 1399,
    name: 'Game of Thrones',
    title: 'Game of Thrones',
    poster_path: '/1XS1oqL89opfnbLl8WnZY1j1uTh.jpg',
    backdrop_path: '/z2y4w9oj2E963h9d8s4G7Y83u3d.jpg',
    first_air_date: '2011-04-17',
    number_of_seasons: 8,
    number_of_episodes: 73,
    vote_average: 8.4,
    vote_count: 22000,
    status: 'Ended',
    overview: 'Seven noble families fight for control of the mythical land of Westeros.',
    genres: [{ id: 10765, name: 'Sci-Fi & Fantasy' }, { id: 18, name: 'Drama' }],
    networks: [{ name: 'HBO' }],
    seasons: [
      { season_number: 1, episode_count: 10, name: 'Season 1' },
      { season_number: 2, episode_count: 10, name: 'Season 2' },
    ],
  },
  {
    id: 66732,
    name: 'Stranger Things',
    title: 'Stranger Things',
    poster_path: '/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    backdrop_path: '/56v2KjBlU4XaOv9r1kXz8LhEjhF.jpg',
    first_air_date: '2016-07-15',
    number_of_seasons: 4,
    number_of_episodes: 34,
    vote_average: 8.6,
    vote_count: 17000,
    status: 'Returning Series',
    overview: 'Supernatural mystery in Hawkins, Indiana.',
    genres: [{ id: 10765, name: 'Sci-Fi & Fantasy' }],
    networks: [{ name: 'Netflix' }],
    seasons: [
      { season_number: 1, episode_count: 8, name: 'Season 1' },
      { season_number: 2, episode_count: 9, name: 'Season 2' },
    ],
  },
];

// Opossum Circuit Breaker helper
const breakerOptions = {
  timeout: 5000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000,
};

function wrapWithCircuitBreaker(actionFn, fallbackFn) {
  if (!tmdb) {
    return { fire: fallbackFn };
  }
  const breaker = new CircuitBreaker(actionFn, breakerOptions);
  breaker.fallback(fallbackFn);
  breaker.on('open', () => console.warn('⚡ TMDb Circuit Breaker OPENED — Routing calls to mock fallback'));
  breaker.on('halfOpen', () => console.log('🔄 TMDb Circuit Breaker HALF-OPEN — Testing TMDb connectivity'));
  breaker.on('close', () => console.log('✅ TMDb Circuit Breaker CLOSED — TMDb healthy'));
  return breaker;
}

// Action functions (live TMDb calls)
const fetchSearchShows = (query, page) => tmdb.get('/search/tv', { params: { query, page } }).then((r) => r.data);
const fetchShowDetail = (tmdbId) => tmdb.get(`/tv/${tmdbId}`, { params: { append_to_response: 'credits,content_ratings,videos,external_ids' } }).then((r) => r.data);
const fetchSeasonDetail = (tmdbId, seasonNumber) => tmdb.get(`/tv/${tmdbId}/season/${seasonNumber}`).then((r) => r.data);
const fetchTrending = () => tmdb.get('/trending/tv/week').then((r) => r.data);
const fetchPopular = (page) => tmdb.get('/tv/popular', { params: { page } }).then((r) => r.data);

// Fallback functions (mock data)
const fallbackSearchShows = (query) => {
  const matches = MOCK_BACKEND_SHOWS.filter((s) => s.name.toLowerCase().includes(query?.toLowerCase() || ''));
  if (matches.length > 0) return { results: matches, page: 1, total_pages: 1, total_results: matches.length };
  return {
    results: [
      {
        id: 99999,
        name: query ? query.charAt(0).toUpperCase() + query.slice(1) : 'Popular Show',
        title: query ? query.charAt(0).toUpperCase() + query.slice(1) : 'Popular Show',
        poster_path: null,
        backdrop_path: null,
        first_air_date: '2023-01-01',
        vote_count: 250,
        number_of_seasons: 1,
        number_of_episodes: 10,
      },
    ],
    page: 1,
    total_pages: 1,
    total_results: 1,
  };
};

const fallbackShowDetail = (tmdbId) => {
  const found = MOCK_BACKEND_SHOWS.find((s) => s.id === Number(tmdbId));
  if (found) return found;
  return {
    id: Number(tmdbId),
    name: `Show #${tmdbId}`,
    poster_path: null,
    backdrop_path: null,
    first_air_date: '2023-01-01',
    number_of_seasons: 2,
    number_of_episodes: 20,
    vote_average: 8.0,
    vote_count: 500,
    status: 'Returning Series',
    overview: 'Show details.',
    genres: [{ name: 'Drama' }],
    networks: [{ name: 'TV Network' }],
    seasons: [
      { season_number: 1, episode_count: 10, name: 'Season 1' },
      { season_number: 2, episode_count: 10, name: 'Season 2' },
    ],
  };
};

const fallbackSeasonDetail = (tmdbId, seasonNumber) => {
  const episodes = [];
  for (let i = 1; i <= 10; i++) {
    episodes.push({
      id: Number(tmdbId) * 100 + Number(seasonNumber) * 10 + i,
      episode_number: i,
      name: `Episode ${i}`,
      runtime: 45,
      air_date: '2023-01-01',
      still_path: null,
    });
  }
  return { season_number: Number(seasonNumber), episodes };
};

const fallbackTrending = () => ({ results: MOCK_BACKEND_SHOWS });
const fallbackPopular = () => ({ results: MOCK_BACKEND_SHOWS });

// Wrapped Circuit Breakers
const searchBreaker = wrapWithCircuitBreaker(fetchSearchShows, fallbackSearchShows);
const showDetailBreaker = wrapWithCircuitBreaker(fetchShowDetail, fallbackShowDetail);
const seasonBreaker = wrapWithCircuitBreaker(fetchSeasonDetail, fallbackSeasonDetail);
const trendingBreaker = wrapWithCircuitBreaker(fetchTrending, fallbackTrending);
const popularBreaker = wrapWithCircuitBreaker(fetchPopular, fallbackPopular);

const tmdbService = {
  async searchShows(query, page = 1) {
    return searchBreaker.fire(query, page);
  },

  async getShow(tmdbId) {
    return showDetailBreaker.fire(tmdbId);
  },

  async getSeason(tmdbId, seasonNumber) {
    return seasonBreaker.fire(tmdbId, seasonNumber);
  },

  async getTrending() {
    return trendingBreaker.fire();
  },

  async getPopular(page = 1) {
    return popularBreaker.fire(page);
  },

  async getShowsByIds(ids) {
    return Promise.all(ids.map((id) => this.getShow(id)));
  },
};

module.exports = tmdbService;
