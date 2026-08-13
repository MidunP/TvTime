import api from './api';
import { checkBackend } from './authService';

const LISTS_KEY = 'tvtime_lists';

function getStorageLists() {
  try {
    return JSON.parse(localStorage.getItem(LISTS_KEY) || '[]');
  } catch {
    return [];
  }
}

function setStorageLists(lists) {
  localStorage.setItem(LISTS_KEY, JSON.stringify(lists));
}

export const listService = {
  async getLists() {
    if (await checkBackend()) {
      try {
        const { data } = await api.get('/lists');
        return data.lists;
      } catch (err) {
        if (!err.response) return getStorageLists();
        throw err;
      }
    }
    return getStorageLists();
  },

  async createList(listData) {
    if (await checkBackend()) {
      try {
        const { data } = await api.post('/lists', listData);
        return data.list;
      } catch (err) {
        if (!err.response) return this._mockCreate(listData);
        throw err;
      }
    }
    return this._mockCreate(listData);
  },

  async updateList(id, updates) {
    if (await checkBackend()) {
      try {
        const { data } = await api.put(`/lists/${id}`, updates);
        return data.list;
      } catch (err) {
        if (!err.response) return this._mockUpdate(id, updates);
        throw err;
      }
    }
    return this._mockUpdate(id, updates);
  },

  async deleteList(id) {
    if (await checkBackend()) {
      try {
        await api.delete(`/lists/${id}`);
        return;
      } catch (err) {
        if (!err.response) return this._mockDelete(id);
        throw err;
      }
    }
    return this._mockDelete(id);
  },

  async addShowToList(listId, tmdbShowId, posterUrl) {
    if (await checkBackend()) {
      try {
        const { data } = await api.post(`/lists/${listId}/shows`, { tmdbShowId, posterUrl });
        return data.list;
      } catch (err) {
        if (!err.response) return this._mockAddShow(listId, tmdbShowId, posterUrl);
        throw err;
      }
    }
    return this._mockAddShow(listId, tmdbShowId, posterUrl);
  },

  async removeShowFromList(listId, tmdbShowId) {
    if (await checkBackend()) {
      try {
        const { data } = await api.delete(`/lists/${listId}/shows/${tmdbShowId}`);
        return data.list;
      } catch (err) {
        if (!err.response) return this._mockRemoveShow(listId, tmdbShowId);
        throw err;
      }
    }
    return this._mockRemoveShow(listId, tmdbShowId);
  },

  async reorderShows(listId, showIds) {
    if (await checkBackend()) {
      try {
        const { data } = await api.put(`/lists/${listId}/reorder`, { showIds });
        return data.list;
      } catch (err) {
        if (!err.response) return this._mockReorder(listId, showIds);
        throw err;
      }
    }
    return this._mockReorder(listId, showIds);
  },

  // Internal localStorage helpers
  _mockCreate(listData) {
    const lists = getStorageLists();
    const newList = {
      _id: 'list_' + Date.now(),
      name: listData.name,
      emoji: listData.emoji || '📺',
      description: listData.description || '',
      isPrivate: !!listData.isPrivate,
      showIds: [],
      posterCache: [],
    };
    lists.push(newList);
    setStorageLists(lists);
    return newList;
  },

  _mockUpdate(id, updates) {
    const lists = getStorageLists();
    const idx = lists.findIndex((l) => l._id === id);
    if (idx > -1) {
      lists[idx] = { ...lists[idx], ...updates };
      setStorageLists(lists);
      return lists[idx];
    }
    return null;
  },

  _mockDelete(id) {
    let lists = getStorageLists();
    lists = lists.filter((l) => l._id !== id);
    setStorageLists(lists);
  },

  _mockAddShow(listId, tmdbShowId, posterUrl) {
    const lists = getStorageLists();
    const idx = lists.findIndex((l) => l._id === listId);
    if (idx > -1) {
      if (!lists[idx].showIds.includes(tmdbShowId)) {
        lists[idx].showIds.push(tmdbShowId);
        if (posterUrl && !lists[idx].posterCache.includes(posterUrl)) {
          lists[idx].posterCache.push(posterUrl);
        }
        setStorageLists(lists);
      }
      return lists[idx];
    }
    return null;
  },

  _mockRemoveShow(listId, tmdbShowId) {
    const lists = getStorageLists();
    const idx = lists.findIndex((l) => l._id === listId);
    if (idx > -1) {
      lists[idx].showIds = lists[idx].showIds.filter((id) => id !== tmdbShowId);
      setStorageLists(lists);
      return lists[idx];
    }
    return null;
  },

  _mockReorder(listId, showIds) {
    const lists = getStorageLists();
    const idx = lists.findIndex((l) => l._id === listId);
    if (idx > -1) {
      lists[idx].showIds = showIds;
      setStorageLists(lists);
      return lists[idx];
    }
    return null;
  },
};
