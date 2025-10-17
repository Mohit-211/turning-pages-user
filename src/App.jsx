import { useState } from 'react'
import './App.css'
import Main from './Page/Main'
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Auth from './Page/Auth/Auth';
import AuthLayout from './Page/Auth/AuthLayout';
import LoginForm from './Page/Auth/LoginForm';
import SignUpForm from './Page/Auth/SignUpForm';
import OtpVerification from './Page/Auth/OtpVerification';
import Dashboard from './Page/Dashboard/Dashboard';
import CreateBook from './Page/Book/CreateBook';
import MyBookPage from './Page/MyBookPage/MyBookPage';
import ProfilePage from './Page/ProfilePage/ProfilePage';
import DashboardLayout from './Page/Dashboard/DashboardLayout';
import PublicRoute from './Page/AuthRoutes/PublicRoute';
import ProtectedRoute from './Page/AuthRoutes/ProtectedRoute';
import AddChapterPage from './Page/AddChapterPage/AddChapterPage';
import ChapterManager from './Page/ChapterManager/ChapterManager';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Main />} />
          {/* <Route path="/auth" element={<Auth />} /> */}
          {/* <Route path="*" element={<Navigate to="/login" />} /> */}
          <Route path="/login" element={
            <PublicRoute>
              <AuthLayout>
                <LoginForm />
              </AuthLayout>
            </PublicRoute>
          } />
          <Route path="/signup" element={
            <AuthLayout>
              <SignUpForm />
            </AuthLayout>
          } />
          <Route path="/otp-verify" element={
            <AuthLayout>
              <OtpVerification />
            </AuthLayout>
          } />
          <Route path="/create-book" element={<CreateBook />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout >
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/profile"
            element={
              <ProtectedRoute>
                <DashboardLayout >
                  <ProfilePage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/books"
            element={
              <ProtectedRoute>
                <DashboardLayout >
                  <MyBookPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
            <Route path="/dashboard/addchapter" element={<AddChapterPage/>} />
            <Route path="/dashboard/chaptermanager" element={<ChapterManager/>} />

        </Routes>
        
      </BrowserRouter>
    </>
  )
}
export default App