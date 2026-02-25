import React, { createContext, useContext, useReducer, useEffect } from "react";
import { AuthState, User } from "../types";
import { storage } from "../utils/storage";

import { mockPatient, mockNutritionist } from "../mocks/mockUser"; // Mientras no está Login

interface AuthContextType {
  authState: AuthState;
  login: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

type AuthAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_USER"; payload: User }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "LOGOUT" };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_USER":
      return {
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case "LOGOUT":
      return {
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [authState, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null,
  });

  //Descomentar cuando esté Login operativo

  // useEffect(() => {
  //   const savedUser = storage.getUser();
  //   if (savedUser) {
  //     dispatch({ type: "SET_USER", payload: savedUser });
  //   } 
  //   else {
  //     dispatch({ type: "SET_LOADING", payload: false });
  //   }
  // }, []);

  // Hasta aquí

  // 🔵 SOLO EN DESARROLLO
  useEffect(() => {
  const savedUser = storage.getUser();

  if (savedUser) {
    dispatch({ type: "SET_USER", payload: savedUser });
    return;
  }

  if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_AUTH !== "false") {
    const MOCK_ROLE: "patient" | "nutritionist" = "patient";
    
    const mockUser =
    MOCK_ROLE === "patient"
      ? mockPatient
      : mockNutritionist;

    storage.setUser(mockUser);
    dispatch({ type: "SET_USER", payload: mockUser });
    return;
  }

  dispatch({ type: "SET_LOADING", payload: false });
}, []);
// Hasta aquí

  const login = (user: User) => {
    storage.setUser(user);
    dispatch({ type: "SET_USER", payload: user });
  };

  const logout = () => {
    storage.clear();
    dispatch({ type: "LOGOUT" });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: "SET_LOADING", payload: loading });
  };

  const setError = (error: string | null) => {
    dispatch({ type: "SET_ERROR", payload: error });
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        login,
        logout,
        setLoading,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
