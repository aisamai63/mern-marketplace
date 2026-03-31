import React, { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // Accepts the full backend response and stores user+token
  const login = (data) => {
    if (data && data.user && data.token) {
      setUser({ ...data.user, token: data.token });
    } else if (data && data.token) {
      setUser(data);
    } else {
      setUser(data);
    }
  };

  // Wishlist (favorites) management
  const fetchFavorites = async () => {
    if (!user) return [];
    try {
      const res = await fetch("/api/users/favorites", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      // Support both { data: { favorites } } and { favorites }
      let favorites = [];
      if (data && data.data && data.data.favorites) {
        favorites = data.data.favorites;
      } else if (data && data.favorites) {
        favorites = data.favorites;
      }
      setUser((u) => ({ ...u, favorites }));
      return favorites;
    } catch (e) { }
    return [];
  };

  const addFavorite = async (listingId) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/users/favorites/${listingId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        fetchFavorites();
      }
    } catch (e) { }
  };

  const removeFavorite = async (listingId) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/users/favorites/${listingId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        fetchFavorites();
      }
    } catch (e) { }
  };

  const logout = () => setUser(null);

  // Expose favorites and refreshFavorites for easier consumption
  const favorites = user?.favorites || [];
  const refreshFavorites = fetchFavorites;

  return (
    <AuthContext.Provider
      value={{
        user,
        favorites,
        login,
        logout,
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
