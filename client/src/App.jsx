import React from 'react'
import './index.css'
import Register from './pages/register.jsx'
import Login from './pages/login.jsx'
import {Routes, Route } from 'react-router-dom';
import AuthProvider from './context/authContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import DashBoard from './pages/dashBoard.jsx';
import AdminDashboard from "./pages/AdminDashboard";
import Home from './pages/Home.jsx';
import Verify from './components/verify.jsx';
import ForgetPass from './pages/forgetPass.jsx'; 

function App() {

  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/forgot-password" element={<ForgetPass />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashBoard />
            </ProtectedRoute>
          }
        />
        <Route
  path="/admin"
  element={<AdminDashboard />}
/>
      </Routes>
    </AuthProvider>
  )
}

export default App
