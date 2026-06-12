import { useAuth } from '../context/AuthContext';

export function useLogin() {
  return useAuth();
}
