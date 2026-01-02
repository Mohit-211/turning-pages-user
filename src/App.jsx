// import React, { useState } from "react";

// import { pdfjs } from "react-pdf";
// import HtmlEditor from "./Page/ChapterManager/PdfWriterPreview/HtmlEditor";
// import PdfPreview from "./Page/ChapterManager/PdfWriterPreview/PdfWriterPreview";
// import { generatePdfFromHtml } from "./Page/ChapterManager/PdfWriterPreview/generatePdf";
// pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//   "pdfjs-dist/build/pdf.worker.min.js",
//   import.meta.url
// ).toString();

// export default function App() {
//   const [html, setHtml] = useState(
//     "<h1>Hello PDF</h1><p>This is a preview</p>"
//   );
//   const [pdfFile, setPdfFile] = useState(null);

//   const handlePreview = async () => {
//     const blob = await generatePdfFromHtml(html);
//     setPdfFile(blob);
//   };

//   return (
//     <div style={{ padding: "20px" }}>
//       <h2>HTML to PDF Preview</h2>

//       <HtmlEditor html={html} setHtml={setHtml} />

//       <button onClick={handlePreview} style={{ margin: "10px 0" }}>
//         Preview PDF
//       </button>

//       <PdfPreview file={pdfFile} />
//     </div>
//   );
// }

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
import Bhavya from './Page/bhavya';
import PaymentPage from './Sections/PaymentPage/PricingPage';
import PricingCards from './Sections/PaymentPage/PricingPage';

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
             <Route path="/demo" element={<Bhavya />} />

            <Route path="/dashboard/chaptermanager/:bookId" element={<ChapterManager/>} />
            <Route path="/payment" element={<PricingCards/>} />


        </Routes>
        
      </BrowserRouter>
    </>
  )
}
export default App