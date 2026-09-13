const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

const TOKEN_KEY = 'realm_jwt_token';

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error: any = new Error(data?.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.errorCode = data?.errorCode || 'API_ERROR';
    error.data = data;
    throw error;
  }

  return data;
}

// 1. Auth API
export const authApi = {
  register: (payload: { username: string; email: string; password: string }) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload: { email: string; password: string }) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  getMe: () =>
    request('/auth/me', { method: 'GET' }),
  logout: () => {
    removeToken();
    try {
      localStorage.removeItem('realm_user');
      localStorage.removeItem('realm_character');
      sessionStorage.clear();
    } catch (e) {
      // ignore storage access restriction
    }
  }
};

// 2. Character API
export const characterApi = {
  getCharacter: () =>
    request('/character', { method: 'GET' }),
  rest: () =>
    request('/character/rest', { method: 'POST' })
};

// 3. Quest API
export const questApi = {
  getQuests: () =>
    request('/quests', { method: 'GET' }),
  getQuestById: (id: string) =>
    request(`/quests/${id}`, { method: 'GET' }),
  createQuest: (questData: any) =>
    request('/quests', { method: 'POST', body: JSON.stringify(questData) }),
  updateQuest: (id: string, questData: any) =>
    request(`/quests/${id}`, { method: 'PUT', body: JSON.stringify(questData) }),
  deleteQuest: (id: string) =>
    request(`/quests/${id}`, { method: 'DELETE' }),
  completeQuest: (id: string) =>
    request(`/quests/${id}/complete`, { method: 'POST' })
};

// 4. Inventory API
export const inventoryApi = {
  getInventory: () =>
    request('/inventory', { method: 'GET' }),
  buyItem: (itemId: string) =>
    request('/inventory/buy', { method: 'POST', body: JSON.stringify({ itemId }) }),
  useItem: (itemId: string) =>
    request('/inventory/use', { method: 'POST', body: JSON.stringify({ itemId }) }),
  equipItem: (itemId: string) =>
    request('/inventory/equip', { method: 'POST', body: JSON.stringify({ itemId }) }),
  sellItem: (itemId: string) =>
    request('/inventory/sell', { method: 'POST', body: JSON.stringify({ itemId }) })
};

// 5. Achievement API
export const achievementApi = {
  getAchievements: () =>
    request('/achievements', { method: 'GET' })
};

// 6. Streak API
export const streakApi = {
  getStreak: () =>
    request('/streak', { method: 'GET' }),
  checkIn: () =>
    request('/streak/check-in', { method: 'POST' })
};

// 7. Activity API
export const activityApi = {
  getActivity: () =>
    request('/activity', { method: 'GET' })
};
