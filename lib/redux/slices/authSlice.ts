import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import type {
  AppDispatch,
  AsyncThunkConfig,
  RootState,
} from "@/lib/redux/store"; // Ensure proper store typing

type User = {
  id: string;
  name: string;
  email: string;
} | null;

interface AuthState {
  user: User;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Helper function to get initial state
const getInitialState = (): AuthState => {
  // Default state for server-side rendering
  const defaultState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  };

  // Only access localStorage on the client side
  if (typeof window === "undefined") {
    return defaultState;
  }

  try {
    const token = localStorage.getItem("token");

    if (token) {
      const decoded = jwtDecode<User & { exp: number }>(token);

      // Check if token is expired
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        return defaultState;
      }

      return {
        user: {
          id: decoded.id,
          name: decoded.name,
          email: decoded.email,
        },
        token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    }
  } catch (error) {
    localStorage.removeItem("token");
  }

  return defaultState;
};

// Async thunks for authentication
export const login = createAsyncThunk(
  "auth/login",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || "Login failed");
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);

      const decoded = jwtDecode<User>(data.token);
      return {
        token: data.token,
        user: {
          id: decoded?.id || "",
          name: decoded?.name || "",
          email: decoded?.email || "",
        },
      };
    } catch (error) {
      return rejectWithValue("Login failed. Please try again.");
    }
  }
);

export const register = createAsyncThunk<
  { token: string; user: User },
  { name: string; email: string; password: string },
  {
    state: RootState;
    dispatch: AppDispatch;
    rejectValue: string;
  }
>("auth/register", async (credentials, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      return rejectWithValue(data.message || "Registration failed");
    }

    localStorage.setItem("token", data.token);

    const decoded = jwtDecode<User>(data.token);
    return {
      token: data.token,
      user: {
        id: decoded?.id || "",
        name: decoded?.name || "",
        email: decoded?.email || "",
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue("Registration failed");
  }
});

// Update the logout action to also clear the HTTP cookie
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch }) => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");

      // Also clear the HTTP cookie by calling the logout API
      try {
        const response = await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to logout on server");
        }
      } catch (error) {
        console.error("Error logging out:", error);
        throw error;
      }
    }

    // Return nothing as we'll handle the state update in the reducer
    return {};
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {
    checkAuth: (state) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) {
          try {
            const decoded = jwtDecode<User & { exp: number }>(token);

            // Check if token is expired
            if (decoded.exp * 1000 < Date.now()) {
              localStorage.removeItem("token");
              state.user = null;
              state.token = null;
              state.isAuthenticated = false;
            } else {
              state.user = {
                id: decoded.id,
                name: decoded.name,
                email: decoded.email,
              };
              state.token = token;
              state.isAuthenticated = true;
            }
          } catch (error) {
            localStorage.removeItem("token");
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
          }
        } else {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        // ✅ Fix: Removed explicit PayloadAction
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        // ✅ Fix: Removed explicit PayloadAction
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { checkAuth } = authSlice.actions;
export default authSlice.reducer;
