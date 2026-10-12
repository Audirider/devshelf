import {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';

import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('devshelf_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() =>
    localStorage.getItem('devshelf_token')
  );

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, []);

  async function register(payload) {
    const response = await api.post('/auth/register', payload);
    return response.data;
  }

  async function login(payload) {
    const response = await api.post('/auth/login', payload);
    const data = response.data;

    const receivedToken =
      data.token ?? data.accessToken ?? data.access_token;

    if (!receivedToken) {
      throw new Error(
        'Login succeeded, but no token was found in the response. Check the backend login response.'
      );
    }

    const receivedUser =
      data.user ?? data.profile ?? {
        email: payload.email,
      };

    localStorage.setItem('devshelf_token', receivedToken);
    localStorage.setItem(
      'devshelf_user',
      JSON.stringify(receivedUser)
    );

    setToken(receivedToken);
    setUser(receivedUser);

    return data;
  }

  function logout() {
    localStorage.removeItem('devshelf_token');
    localStorage.removeItem('devshelf_user');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(token),
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
