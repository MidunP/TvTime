import api from './api';

export const listService = {
  async getLists() {
    const { data } = await api.get('/lists');
    return data.lists;
  },

  async createList(listData) {
    const { data } = await api.post('/lists', listData);
    return data.list;
  },

  async updateList(id, updates) {
    const { data } = await api.put(`/lists/${id}`, updates);
    return data.list;
  },

  async deleteList(id) {
    await api.delete(`/lists/${id}`);
  },

  async addShowToList(listId, tmdbShowId, posterUrl) {
    const { data } = await api.post(`/lists/${listId}/shows`, { tmdbShowId, posterUrl });
    return data.list;
  },

  async removeShowFromList(listId, tmdbShowId) {
    const { data } = await api.delete(`/lists/${listId}/shows/${tmdbShowId}`);
    return data.list;
  },

  async reorderShows(listId, showIds) {
    const { data } = await api.put(`/lists/${listId}/reorder`, { showIds });
    return data.list;
  },
};
