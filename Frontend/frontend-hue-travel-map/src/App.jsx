import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { visitService } from './services/visitService';


import MapPage from './pages/MapPage';
import MySuggestionsPage from './pages/MySuggestionsPage';
import MyCheckinsPage from './pages/MyCheckinsPage';

import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUserPage from './pages/admin/AdminUserPage';
import AdminCategoryPage from './pages/admin/AdminCategoryPage';
import AdminPlacePage from './pages/admin/AdminPlacePage';
import AdminCheckinPage from './pages/admin/AdminCheckinPage';
import AdminSuggestionPage from './pages/admin/AdminSuggestionPage';

function App() {
  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user && user.role === 'ADMIN';

  useEffect(() => {
    if (!sessionStorage.getItem('hasVisited')) {
      visitService.recordVisit().catch(err => console.log('Lỗi đếm truy cập:', err));
      sessionStorage.setItem('hasVisited', 'true');
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* --- ROUTES NGƯỜI DÙNG --- */}
        <Route path="/" element={<MapPage />} />
        <Route path="/my-suggestions" element={<MySuggestionsPage />} />
        <Route path="/my-checkins" element={<MyCheckinsPage />} />

        {/* --- ROUTES ADMIN --- */}
        <Route path="/admin" element={isAdmin ? <AdminLayout /> : <Navigate to="/" replace />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUserPage />} />
          <Route path="categories" element={<AdminCategoryPage />} />
          <Route path="places" element={<AdminPlacePage />} />
          <Route path="checkins" element={<AdminCheckinPage />} />
          <Route path="suggestions" element={<AdminSuggestionPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;