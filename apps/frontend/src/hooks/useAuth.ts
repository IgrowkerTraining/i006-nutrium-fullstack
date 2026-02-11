import { useAuth as useAuthContext } from '../context/AuthContext';
import { User } from '../types';

export const useAuth = () => {
  const { authState, login, logout, setLoading, setError } = useAuthContext();

  const loginUser = (user: User) => {
    login(user);
  };

  const logoutUser = () => {
    logout();
  };

  const clearError = () => {
    setError(null);
  };

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    loading: authState.loading,
    error: authState.error,
    login: loginUser,
    logout: logoutUser,
    setLoading,
    setError,
    clearError,
  };
};
