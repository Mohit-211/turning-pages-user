import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
/* Pages */
import Main from "./Page/Main";
import Dashboard from "./Page/Dashboard/Dashboard";
import CreateBook from "./Page/Book/CreateBook";
import MyBookPage from "./Page/MyBookPage/MyBookPage";
import ProfilePage from "./Page/ProfilePage/ProfilePage";
import AddChapterPage from "./Page/AddChapterPage/AddChapterPage";
import ChapterManager from "./Page/ChapterManager/ChapterManager";
import Submissions from "./Page/Submissions/Submissions";
/* Layouts */
import AuthLayout from "./Page/Auth/AuthLayout";
import DashboardLayout from "./Page/Dashboard/DashboardLayout";
/* Auth Forms */
import LoginForm from "./Page/Auth/forms/LoginForm";
import SignUpForm from "./Page/Auth/forms/SignUpForm";
import OtpVerification from "./Page/Auth/forms/OtpVerification";
/* Routes Guards */
import PublicRoute from "./Page/AuthRoutes/PublicRoute";
import ProtectedRoute from "./Page/AuthRoutes/ProtectedRoute";
/* Payments */
import SupportDashboard from "./Page/Support/Support";
import FeedPage from "./component/FeedPage/FeedPage";
import QuotesPage from "./component/Quotesmodule/QuotesPage";
import Chat from "./Page/Chat/Chat";
import DirectoryPage from "./component/FeedPage/DirectoryPage";
import ForgotPassword from "./Page/Auth/forms/ForgotPassword";
import SendOtp from "./Page/Auth/forms/SendOtp";
import ChangePassword from "./Page/Auth/forms/ChangePassword";
import CreditSystem from "./Page/CreditPage/CreditPage";
import AIToolsGuide from "./Page/ChapterManager/chapterComponent/AIToolsGuide";
import PricingPage from "./Sections/PaymentPage/PricingPage";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing */}
        {/* <Route path="/" element={<Main />} /> */}
        <Route
          path="/"
          element={
            localStorage.getItem("book_publish_token") ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        {/* -------------------- AUTH -------------------- */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <AuthLayout>
                <LoginForm />
              </AuthLayout>
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <AuthLayout>
                <SignUpForm />
              </AuthLayout>
            </PublicRoute>
          }
        />
        <Route
          path="/auth/forgot-password-sendotp"
          element={
            <PublicRoute>
              <AuthLayout>
                <SendOtp />
              </AuthLayout>
            </PublicRoute>
          }
        />
        <Route
          path="/auth/forgot-password"
          element={
            <PublicRoute>
              <AuthLayout>
                <ForgotPassword />
              </AuthLayout>
            </PublicRoute>
          }
        />
        <Route
          path="/otp-verify"
          element={
            <PublicRoute>
              <AuthLayout>
                <OtpVerification />
              </AuthLayout>
            </PublicRoute>
          }
        />
        <Route
          path="/dashboard/change-password"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ChangePassword />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        {/* -------------------- DASHBOARD -------------------- */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/profile"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ProfilePage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/books"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <MyBookPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/addchapter"
          element={
            <ProtectedRoute>
              <AddChapterPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/submissions"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Submissions />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/support"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <SupportDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/chaptermanager/:bookId"
          element={
            <ProtectedRoute>
              <ChapterManager />
            </ProtectedRoute>
          }
        />
        <Route path="/dashboard/chaptermanager/:bookId/view" element={<ChapterManager />} />
        <Route
          path="/dashboard/my-feed"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <FeedPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/social-feed"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <DirectoryPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/ai-tools-guide"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <AIToolsGuide />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/quotes"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <QuotesPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/credits"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <CreditSystem />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/chat/:book_room_id?"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Chat />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/payment"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <PricingPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/publish-payment"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <PricingPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
         <Route
          path="/create-book"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <CreateBook />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
      />
    </BrowserRouter>
  );
}
export default App;