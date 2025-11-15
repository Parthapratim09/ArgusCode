import React from 'react'
import './index.css'
import Register from './pages/register.jsx'
import Login from './pages/login.jsx'
import {Routes, Route } from 'react-router-dom';
import AuthProvider from './context/authContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import DashBoard from './pages/dashBoard.jsx';
function App() {

  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashBoard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  )
}

export default App
