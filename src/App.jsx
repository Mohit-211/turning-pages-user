import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

/* Pages */
import Main from "./Page/Main";
import Dashboard from "./Page/Dashboard/Dashboard";
import CreateBook from "./Page/Book/CreateBook";
import MyBookPage from "./Page/MyBookPage/MyBookPage";
import ProfilePage from "./Page/ProfilePage/ProfilePage";
import AddChapterPage from "./Page/AddChapterPage/AddChapterPage";
import ChapterManager from "./Page/ChapterManager/ChapterManager";
import Submissions from "./Page/Submissions/Submissions";
import Bhavya from "./Page/bhavya";

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
import PricingCards from "./Sections/PaymentPage/PricingPage";
import SupportDashboard from "./Page/Support/Support";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing */}
        <Route path="/" element={<Main />} />

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
          path="/otp-verify"
          element={
            <PublicRoute>
              <AuthLayout>
                <OtpVerification />
              </AuthLayout>
            </PublicRoute>
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

        {/* -------------------- MISC -------------------- */}
        <Route path="/create-book" element={<CreateBook />} />
        <Route path="/payment" element={<PricingCards />} />
        <Route path="/demo" element={<Bhavya />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
