import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { ToastContainer } from './components/ui/ToastContainer';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { SkeletonLoader } from './components/ui/SkeletonLoader';
import { useOffline } from './hooks/useOffline';

// Non-lazy for fast initial load
import { Landing } from './pages/Landing';
import { Auth } from './pages/Auth';

// Lazy loaded page components
const Onboarding = lazy(() => import('./pages/Onboarding').then(m => ({ default: m.Onboarding })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Scanner = lazy(() => import('./pages/Scanner').then(m => ({ default: m.Scanner })));
const FoodLog = lazy(() => import('./pages/FoodLog').then(m => ({ default: m.FoodLog })));
const DietPlan = lazy(() => import('./pages/DietPlan').then(m => ({ default: m.DietPlan })));
const Reports = lazy(() => import('./pages/Reports').then(m => ({ default: m.Reports })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const Notifications = lazy(() => import('./pages/Notifications').then(m => ({ default: m.Notifications })));
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));

// Layout wrapper for protected app pages
const AppLayout = () => {
  return (
    <div className="min-h-screen bg-white flex w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
};

// Suspense Fallback
const LoadingFallback = () => (
  <div className="min-h-screen p-8 flex flex-col gap-6 max-w-5xl mx-auto">
    <SkeletonLoader width="200px" height="32px" />
    <SkeletonLoader variant="card" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <SkeletonLoader variant="card" />
      <SkeletonLoader variant="card" />
      <SkeletonLoader variant="card" />
    </div>
  </div>
);

export default function App() {
  useOffline();

  return (
    <ErrorBoundary>
      <ToastContainer />
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth-success" element={<Auth />} />

            <Route
              path="/onboarding"
              element={
                <ProtectedRoute requiresProfile={false}>
                  <Onboarding />
                </ProtectedRoute>
              }
            />

            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/scan" element={<ProtectedRoute><Scanner /></ProtectedRoute>} />
              <Route path="/food-log" element={<ProtectedRoute><FoodLog /></ProtectedRoute>} />
              <Route path="/diet-plan" element={<ProtectedRoute><DietPlan /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
