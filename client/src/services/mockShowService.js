// Mock Show Service — stores watchlist, episode progress, and custom lists in localStorage
// Provides fallback when backend server is offline or in mock session mode

const WATCHLIST_KEY = 'tvtime_watchlist';
const EPISODES_KEY = 'tvtime_episodes';
const LISTS_KEY = 'tvtime_lists';

const MOCK_SHOWS = [
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
    overview: 'A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine with a former student to secure his family\'s financial future.',
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
    overview: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.',
    genres: [{ id: 10765, name: 'Sci-Fi & Fantasy' }, { id: 18, name: 'Drama' }],
    networks: [{ name: 'Netflix' }],
    seasons: [
      { season_number: 1, episode_count: 8, name: 'Season 1' },
      { season_number: 2, episode_count: 9, name: 'Season 2' },
    ],
  },
];

const MOCK_EPISODES = {
  1396: {
    1: [
      { id: 62085, episode_number: 1, name: 'Pilot', runtime: 58, air_date: '2008-01-20', still_path: '/sub/1396_1_1.jpg' },
      { id: 62086, episode_number: 2, name: "Cat's in the Bag...", runtime: 48, air_date: '2008-01-27', still_path: null },
      { id: 62087, episode_number: 3, name: "...And the Bag's in the River", runtime: 48, air_date: '2008-02-10', still_path: null },
      { id: 62088, episode_number: 4, name: 'Cancer Man', runtime: 48, air_date: '2008-02-17', still_path: null },
      { id: 62089, episode_number: 5, name: 'Gray Matter', runtime: 48, air_date: '2008-02-24', still_path: null },
      { id: 62090, episode_number: 6, name: "Crazy Handful Nothin'", runtime: 48, air_date: '2008-03-02', still_path: null },
      { id: 62091, episode_number: 7, name: 'A No-Rough-Stuff-Type Deal', runtime: 48, air_date: '2008-03-09', still_path: null },
    ],
    2: [
      { id: 62092, episode_number: 1, name: 'Seven Thirty-Seven', runtime: 47, air_date: '2009-03-08', still_path: null },
      { id: 62093, episode_number: 2, name: 'Grilled', runtime: 48, air_date: '2009-03-15', still_path: null },
      { id: 62094, episode_number: 3, name: 'Bit by a Dead Bee', runtime: 47, air_date: '2009-03-22', still_path: null },
    ],
  },
};

function getStorage(key, defaultVal = []) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(defaultVal));
  } catch {
    return defaultVal;
  }
}

function setStorage(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

export const mockShowService = {
  addShow(showData) {
    const list = getStorage(WATCHLIST_KEY, []);
    const existing = list.find((item) => item.tmdbShowId === showData.tmdbShowId);
    if (existing) return existing;

    const item = {
      _id: 'mock_item_' + showData.tmdbShowId,
      tmdbShowId: showData.tmdbShowId,
      showTitle: showData.showTitle,
      showPoster: showData.showPoster || null,
      showBackdrop: showData.showBackdrop || null,
      showYear: showData.showYear || '2024',
      totalEpisodes: showData.totalEpisodes || 20,
      totalSeasons: showData.totalSeasons || 1,
      genres: showData.genres || [],
      networks: showData.networks || [],
      status: 'watchlist',
      isFavorite: false,
      userRating: null,
      notes: null,
      watchedEpisodesCount: 0,
      currentSeason: 1,
      currentEpisode: 1,
      addedAt: new Date().toISOString(),
      lastWatchedAt: null,
      completedAt: null,
    };
    list.push(item);
    setStorage(WATCHLIST_KEY, list);
    return item;
  },

  getWatchlist(status = null) {
    const list = getStorage(WATCHLIST_KEY, []);
    if (status) {
      return list.filter((i) => i.status === status);
    }
    return list;
  },

  getShow(tmdbId) {
    const list = getStorage(WATCHLIST_KEY, []);
    const item = list.find((i) => i.tmdbShowId === Number(tmdbId));
    if (!item) throw new Error('Show not in watchlist');
    return item;
  },

  updateStatus(tmdbId, updates) {
    const list = getStorage(WATCHLIST_KEY, []);
    const index = list.findIndex((i) => i.tmdbShowId === Number(tmdbId));
    if (index === -1) throw new Error('Show not in watchlist');

    list[index] = { ...list[index], ...updates };
    if (updates.status === 'completed') {
      list[index].completedAt = new Date().toISOString();
    }
    setStorage(WATCHLIST_KEY, list);
    return list[index];
  },

  removeShow(tmdbId) {
    let list = getStorage(WATCHLIST_KEY, []);
    list = list.filter((i) => i.tmdbShowId !== Number(tmdbId));
    setStorage(WATCHLIST_KEY, list);

    let episodes = getStorage(EPISODES_KEY, []);
    episodes = episodes.filter((ep) => ep.tmdbShowId !== Number(tmdbId));
    setStorage(EPISODES_KEY, episodes);
  },

  getProgress(tmdbId) {
    const episodes = getStorage(EPISODES_KEY, []);
    const watched = episodes.filter((ep) => ep.tmdbShowId === Number(tmdbId));
    const watchedSet = {};
    watched.forEach((ep) => {
      watchedSet[`${ep.season}-${ep.episode}`] = {
        rewatchCount: ep.rewatchCount || 0,
        watchedAt: ep.watchedAt,
      };
    });
    return { watchedCount: watched.length, watchedSet };
  },

  markWatched({ tmdbShowId, season, episode, episodeName, runtime = 45, airDate }) {
    const episodes = getStorage(EPISODES_KEY, []);
    const index = episodes.findIndex(
      (ep) => ep.tmdbShowId === tmdbShowId && ep.season === season && ep.episode === episode
    );
    const now = new Date().toISOString();

    let epObj;
    if (index > -1) {
      episodes[index].watchedAt = now;
      episodes[index].runtime = runtime;
      epObj = episodes[index];
    } else {
      epObj = {
        _id: 'ep_' + tmdbShowId + '_' + season + '_' + episode,
        tmdbShowId,
        season,
        episode,
        episodeName: episodeName || `Episode ${episode}`,
        runtime: runtime || 45,
        airDate: airDate || null,
        rewatchCount: 0,
        watchedAt: now,
      };
      episodes.push(epObj);
    }
    setStorage(EPISODES_KEY, episodes);

    // Update watchlist item status and count
    const list = getStorage(WATCHLIST_KEY, []);
    const showIdx = list.findIndex((i) => i.tmdbShowId === tmdbShowId);
    if (showIdx > -1) {
      const showEps = episodes.filter((e) => e.tmdbShowId === tmdbShowId);
      list[showIdx].watchedEpisodesCount = showEps.length;
      list[showIdx].currentSeason = season;
      list[showIdx].currentEpisode = episode;
      list[showIdx].lastWatchedAt = now;

      // Auto shift from watchlist to watching when episode is checked
      if (list[showIdx].status === 'watchlist') {
        list[showIdx].status = 'watching';
      }
      setStorage(WATCHLIST_KEY, list);
    }

    return { episode: epObj, watchedCount: episodes.filter((e) => e.tmdbShowId === tmdbShowId).length };
  },

  markUnwatched({ tmdbShowId, season, episode }) {
    let episodes = getStorage(EPISODES_KEY, []);
    episodes = episodes.filter(
      (ep) => !(ep.tmdbShowId === tmdbShowId && ep.season === season && ep.episode === episode)
    );
    setStorage(EPISODES_KEY, episodes);

    const list = getStorage(WATCHLIST_KEY, []);
    const showIdx = list.findIndex((i) => i.tmdbShowId === tmdbShowId);
    if (showIdx > -1) {
      const showEps = episodes.filter((e) => e.tmdbShowId === tmdbShowId);
      list[showIdx].watchedEpisodesCount = showEps.length;
      setStorage(WATCHLIST_KEY, list);
    }

    return { message: 'Episode marked unwatched' };
  },

  markRewatched({ tmdbShowId, season, episode }) {
    const episodes = getStorage(EPISODES_KEY, []);
    const ep = episodes.find(
      (e) => e.tmdbShowId === tmdbShowId && e.season === season && e.episode === episode
    );
    if (ep) {
      ep.rewatchCount = (ep.rewatchCount || 0) + 1;
      setStorage(EPISODES_KEY, episodes);
    }
    return { episode: ep };
  },

  getStats() {
    const episodes = getStorage(EPISODES_KEY, []);
    const watchlist = getStorage(WATCHLIST_KEY, []);

    const totalEpisodes = episodes.length;
    const showsTracked = watchlist.length;
    const completedShows = watchlist.filter((s) => s.status === 'completed').length;
    const totalMinutes = episodes.reduce((sum, ep) => sum + (ep.runtime || 45), 0);
    const hoursWatched = Math.round(totalMinutes / 60);

    return {
      totalEpisodes,
      showsTracked,
      completedShows,
      hoursWatched,
      currentStreak: totalEpisodes > 0 ? 1 : 0,
      longestStreak: totalEpisodes > 0 ? 1 : 0,
      episodesThisWeek: episodes.length,
      heatmapData: {},
    };
  },

  searchShows(query) {
    const q = query.toLowerCase();
    const matches = MOCK_SHOWS.filter((s) => s.name.toLowerCase().includes(q));
    if (matches.length > 0) return { results: matches };

    // Fallback search result for custom query
    return {
      results: [
        {
          id: 99999,
          name: query.charAt(0).toUpperCase() + query.slice(1),
          title: query.charAt(0).toUpperCase() + query.slice(1),
          poster_path: null,
          backdrop_path: null,
          first_air_date: '2023-01-01',
          vote_count: 120,
          number_of_seasons: 1,
          number_of_episodes: 10,
        },
      ],
    };
  },

  getTmdbShow(tmdbId) {
    const found = MOCK_SHOWS.find((s) => s.id === Number(tmdbId));
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
      overview: 'Details for this show.',
      seasons: [
        { season_number: 1, episode_count: 10, name: 'Season 1' },
        { season_number: 2, episode_count: 10, name: 'Season 2' },
      ],
    };
  },

  getTmdbSeason(tmdbId, seasonNumber) {
    const showEps = MOCK_EPISODES[tmdbId]?.[seasonNumber];
    if (showEps) {
      return { season_number: Number(seasonNumber), episodes: showEps };
    }

    // Default mock episodes list for season
    const eps = [];
    for (let i = 1; i <= 10; i++) {
      eps.push({
        id: Number(tmdbId) * 100 + Number(seasonNumber) * 10 + i,
        episode_number: i,
        name: `Episode ${i}`,
        runtime: 45,
        air_date: '2023-01-01',
        still_path: null,
      });
    }
    return { season_number: Number(seasonNumber), episodes: eps };
  },

  getTrending() {
    return { results: MOCK_SHOWS };
  },
};
