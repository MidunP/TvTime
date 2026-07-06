// Mock Auth Service — stores users in localStorage
// This lets the app work without a backend for frontend development/testing

const USERS_KEY = 'tvtime_users';
const SESSION_KEY = 'tvtime_session';

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const mockAuthService = {
  register(username, password, displayName) {
    const users = getUsers();
    const existing = users.find((u) => u.username.toLowerCase() === username.toLowerCase());
    if (existing) {
      throw { response: { data: { message: 'Username already taken' } } };
    }
    const user = {
      _id: generateId(),
      username: username.toLowerCase(),
      displayName: displayName || username,
      password, // In a real app this would be hashed — this is mock only
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    saveUsers(users);

    const session = { userId: user._id, username: user.username, displayName: user.displayName };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    localStorage.setItem('accessToken', 'mock_token_' + user._id);

    return { _id: user._id, username: user.username, displayName: user.displayName };
  },

  login(username, password) {
    const users = getUsers();
    const user = users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );
    if (!user) {
      throw { response: { data: { message: 'Invalid username or password' } } };
    }

    const session = { userId: user._id, username: user.username, displayName: user.displayName };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    localStorage.setItem('accessToken', 'mock_token_' + user._id);

    return { _id: user._id, username: user.username, displayName: user.displayName };
  },

  logout() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem('accessToken');
  },

  getMe() {
    const session = localStorage.getItem(SESSION_KEY);
    if (!session) throw new Error('Not logged in');
    return JSON.parse(session);
  },

  isLoggedIn() {
    return !!localStorage.getItem(SESSION_KEY);
  },
};
