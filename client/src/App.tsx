import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { EmergencyModal } from './components/EmergencyModal';

// Pages
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { MentalHealthPage } from './pages/MentalHealthPage';
import { PhysicalHealthPage } from './pages/PhysicalHealthPage';
import { ChatPage } from './pages/ChatPage';
import { ProfilePage } from './pages/ProfilePage';
import { EmergencyPage } from './pages/EmergencyPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { PhoneCall } from 'lucide-react';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-wellness-dark">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500 animate-pulse flex items-center justify-center text-white">
            🌿
          </div>
          <span className="text-xs font-semibold text-slate-500">Restoring your sanctuary...</span>
        </div>
      </div>
    );
  }
  // For easy exploration, if not logged in, we let them proceed or render dashboard with demo data
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-wellness-cream dark:bg-wellness-dark text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <Navbar onOpenEmergency={() => setShowEmergencyModal(true)} />

      <div className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="/mental-health" element={<MentalHealthPage />} />
          <Route path="/physical-health" element={<PhysicalHealthPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/emergency" element={<EmergencyPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <Footer />

      {/* Floating 24/7 Crisis Help Button for fast accessibility */}
      <button
        onClick={() => setShowEmergencyModal(true)}
        aria-label="24/7 Crisis & Emergency Help"
        title="Emergency Help (24/7)"
        className="fixed bottom-6 right-6 z-40 p-3.5 sm:px-4 sm:py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xl shadow-rose-600/30 flex items-center gap-2 hover:scale-105 transition-all"
      >
        <PhoneCall className="w-4 h-4 animate-bounce" />
        <span className="hidden sm:inline">Crisis Support (988)</span>
      </button>

      {/* Emergency Crisis Modal */}
      <EmergencyModal
        isOpen={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
