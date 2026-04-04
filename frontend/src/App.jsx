import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import AppToastContainer from "./components/AppToastContainer";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Listings from "./pages/Listings";
import MyListings from "./pages/MyListings";
import AddListing from "./pages/AddListing";
import EditListing from "./pages/EditListing";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Profile from "./pages/Profile";

import ListingDetails from "./pages/ListingDetails";
import Wishlist from "./pages/Wishlist";
import AdminDashboard from "./pages/AdminDashboard";
import Messages from "./pages/Messages";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <AppToastContainer />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/my-listings" element={<ProtectedRoute><MyListings /></ProtectedRoute>} />
          <Route
            path="/add-listing"
            element={
              <ProtectedRoute>
                <AddListing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-listing/:id"
            element={
              <ProtectedRoute>
                <EditListing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route path="/listings/:id" element={<ListingDetails />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/listings" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
