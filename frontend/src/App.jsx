import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CreatorDashboard from './pages/CreatorDashboard';
import ConsumerFeed from './pages/ConsumerFeed';
import ImageDetailPage from './pages/ImageDetailPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import BookmarksPage from './pages/BookmarksPage';
import ProfilePage from './pages/ProfilePage';
import Navbar from './components/Navbar';

function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/unauthorized" replace />;
  return children;
}


function HomeRedirect() {
  const { user } = useAuth();
  if (user) return <Navigate to="/feed" replace />;
  return <LandingPage />;
}

function GuestRoute({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/feed" replace />;
  return children;
}
function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route
          path="/creator"
          element={
            <ProtectedRoute role="creator">
              <CreatorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/feed"
          element={
            <ProtectedRoute>
              <ConsumerFeed />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookmarks"
          element={
            <ProtectedRoute>
              <BookmarksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/images/:id"
          element={
            <ProtectedRoute>
              <ImageDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
