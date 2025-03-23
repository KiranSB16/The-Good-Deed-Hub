import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useEffect } from "react";
import Register from "@/components/Register.jsx";
import Login from "@/components/Login.jsx";
import ForgotPassword from "@/components/ForgotPassword.jsx";
import ResetPassword from "@/components/ResetPassword.jsx";
import Home from "@/components/Home.jsx";
import Fundraiser from "@/components/fundraiser/Fundraiser.jsx";
import CauseList from "@/components/CauseList.jsx";
import CauseDetail from "@/components/CauseDetail.jsx";
import CreateCause from "@/components/CreateCause.jsx";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from 'react-hot-toast';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import CategoryManagement from './components/admin/CategoryManagement';
import CauseManagement from './components/admin/CauseManagement';
import UserManagement from './components/admin/UserManagement';
import AdminCauseDetails from './components/admin/AdminCauseDetails';
import Analytics from './components/admin/Analytics';
import DonorLayout from './components/donor/DonorLayout';
import DonorDashboard from './components/donor/DonorDashboard';
import DonorProfile from './components/donor/DonorProfile';
import DonorDonations from './components/donor/DonorDonations';
import SavedCauses from './components/donor/SavedCauses';
import EditCause from './components/EditCause';
import { useSelector, useDispatch } from 'react-redux';
import PaymentSuccess from '@/components/payment/PaymentSuccess';
import PaymentFailed from "@/components/payment/PaymentFailed";

// Protected Route component with role check
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useSelector((state) => state.user);
  const token = localStorage.getItem('token');

  if (!user || !token || user.role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Main App component
const App = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    // Check if there's a stored user and token
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        // Parse the stored user data
        const userData = JSON.parse(storedUser);
        // Dispatch an action to set the user in Redux state
        dispatch({ type: 'user/setUser', payload: userData });
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, [dispatch]);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/causes" element={<CauseList />} />
        <Route path="/causes/:id" element={<CauseDetail />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-failed" element={<PaymentFailed />} />
        <Route
          path="/create-cause"
          element={
            <ProtectedRoute requiredRole="fundraiser">
              <CreateCause />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/*"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="causes" element={<CauseManagement />} />
          <Route path="causes/:id" element={<AdminCauseDetails />} />
          <Route path="categories" element={<CategoryManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>

        <Route
          path="/donor/*"
          element={
            <ProtectedRoute requiredRole="donor">
              <DonorLayout>
                <Outlet />
              </DonorLayout>
            </ProtectedRoute>
          }
        >
          <Route index element={<DonorDashboard />} />
          <Route path="profile" element={<DonorProfile />} />
          <Route path="donations" element={<DonorDonations />} />
          <Route path="saved" element={<SavedCauses />} />
        </Route>

        <Route
          path="/fundraiser/*"
          element={
            <ProtectedRoute requiredRole="fundraiser">
              <Fundraiser />
            </ProtectedRoute>
          }
        >
          <Route index element={<></>} />
          <Route path="profile" element={<></>} />
          <Route path="causes" element={<></>} />
          <Route path="causes/edit/:id" element={<></>} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
};

export default App;
