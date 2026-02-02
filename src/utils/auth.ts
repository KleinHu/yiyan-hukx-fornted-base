const TOKEN_KEY = 'token';
const ACCESS_TOKEN = 'pro__Access-Token';

const isLogin = () => {
  // return !!localStorage.getItem(TOKEN_KEY);
  return !!sessionStorage.getItem(TOKEN_KEY);
};

const getToken = () => {
  // return localStorage.getItem(TOKEN_KEY);
  return sessionStorage.getItem(TOKEN_KEY);
};

const setToken = (token: string) => {
  // localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ACCESS_TOKEN, JSON.stringify({ value: token }));
  sessionStorage.setItem(TOKEN_KEY, token);
};

const clearToken = () => {
  // localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ACCESS_TOKEN);
  sessionStorage.removeItem(TOKEN_KEY);
};

export { isLogin, getToken, setToken, clearToken };
