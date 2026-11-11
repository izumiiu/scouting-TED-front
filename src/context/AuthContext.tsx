import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api, ApiError, mutation } from "../lib/api";
import type { User } from "../types/intake";
interface Auth {
  user: User | null;
  loading: boolean;
  connectionError: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  reload: () => void;
}
const Context = createContext<Auth | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null),
    [loading, setLoading] = useState(true),
    [connectionError, setError] = useState(false),
    [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let live = true;
    api<{ user: User }>("/auth/me")
      .then((data) => {
        if (live) {
          setUser(data.user);
          setError(false);
        }
      })
      .catch((e) => {
        if (live) {
          setUser(null);
          setError(!(e instanceof ApiError && e.status === 401));
        }
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    const expired = () => setUser(null);
    window.addEventListener("ted:session-expired", expired);
    return () => {
      live = false;
      window.removeEventListener("ted:session-expired", expired);
    };
  }, [attempt]);
  return (
    <Context.Provider
      value={{
        user,
        loading,
        connectionError,
        login: async (email, password) => {
          const data = await api<{ user: User }>(
            "/auth/login",
            mutation("POST", { email, password }),
          );
          setUser(data.user);
          setError(false);
        },
        logout: async () => {
          await api("/auth/logout", mutation("POST", {}));
          setUser(null);
        },
        reload: () => {
          setLoading(true);
          setAttempt((n) => n + 1);
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
// Context hook is shared by pages, not a component.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const value = useContext(Context);
  if (!value) throw new Error("AuthProvider missing");
  return value;
}
