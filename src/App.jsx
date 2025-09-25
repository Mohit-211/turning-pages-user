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
function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/auth" element={<Auth />} />
          {/* <Route path="*" element={<Navigate to="/login" />} /> */}
          <Route path="/login" element={
            <AuthLayout>
              <LoginForm />
            </AuthLayout>
          } />
          <Route path="/login" element={
            <AuthLayout>
              <LoginForm />
            </AuthLayout>
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
          <Route path="/dashboard" element={<Dashboard/>} />
          <Route path="/create-book" element={<CreateBook />} />

        </Routes>
      </BrowserRouter>
    </>
  )
}
export default App