import React, { createContext, useState, useEffect, useContext } from "react";
import api from "../utils/api";
import toast from "../utils/toast";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  // Persist user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // On mount, re-validate the stored token against /api/auth/me
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return;

    let parsed;
    try {
      parsed = JSON.parse(stored);
    } catch (_) {
      return;
    }

    const token = localStorage.getItem("token") || parsed?.token;
    if (!token) return;

    // Keep auth state consistent if token is saved separately.
    if (!parsed?.token || parsed.token !== token) {
      setUser({ ...parsed, token });
    }

    api
      .get("/api/auth/me")
      .then((res) => {
        // Refresh user data from server while keeping the token
        const fresh = res.data?.data;
        if (fresh) {
          setUser((prev) => ({ ...fresh, token: prev?.token || parsed.token }));
        }
      })
      .catch((err) => {
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          setUser(null);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Accepts the full backend response and stores user+token
  const login = (data) => {
    if (data?.token) {
      localStorage.setItem("token", data.token); // store token separately
    }

    if (data && data.user && data.token) {
      setUser({ ...data.user, token: data.token });
    } else {
      setUser(data);
    }
  };

  // Merge a partial update into the current user (used after profile edits)
  const updateUser = (partial) => {
    setUser((prev) => (prev ? { ...prev, ...partial } : prev));
  };

  // Wishlist (favorites) management
  const fetchFavorites = async () => {
    if (!user) return [];
    try {
      const res = await api.get("/api/users/favorites");
      const data = res.data;
      let favorites = [];
      if (data && data.data && data.data.favorites) {
        favorites = data.data.favorites;
      } else if (data && data.favorites) {
        favorites = data.favorites;
      }
      setUser((u) => {
        if (!u) return u;
        // Only update if favorites actually changed
        const oldFavs = u.favorites || [];
        const same = Array.isArray(favorites) && Array.isArray(oldFavs) && favorites.length === oldFavs.length && favorites.every((f, i) => f._id === oldFavs[i]?._id);
        if (same) return u;
        return { ...u, favorites };
      });
      return favorites;
    } catch (e) { }
    return [];
  };

  const addFavorite = async (listingId) => {
    if (!user) return false;
    try {
      const res = await api.post(`/api/users/favorites/${listingId}`);
      if (res.status >= 200 && res.status < 300) {
        await fetchFavorites();
        toast.success("Added to your wishlist!");
        return true;
      }
    } catch (e) {
      toast.error("Failed to add to wishlist.");
    }
    return false;
  };

  const removeFavorite = async (listingId) => {
    if (!user) return;
    try {
      const res = await api.delete(`/api/users/favorites/${listingId}`);
      if (res.status >= 200 && res.status < 300) {
        fetchFavorites();
      }
    } catch (e) { }
  };

  const logout = () => {
    localStorage.removeItem("token"); //  removed token
    setUser(null);
  };

  // Expose favorites and refreshFavorites for easier consumption
  const favorites = user?.favorites || [];
  const refreshFavorites = fetchFavorites;
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        favorites,
        login,
        logout,
        updateUser,
        fetchFavorites,
        refreshFavorites,
        addFavorite,
        removeFavorite,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}


