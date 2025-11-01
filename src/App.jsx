import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import ApplicationForm from './components/ApplicationForm.jsx';
import ProgramsPage from './components/ProgramsPage.jsx';
import Navigation from './components/Navigation.jsx';
import HeroSection from './components/HeroSection.jsx';
import ProgramsSection from './components/ProgramsSection.jsx';
import AdmissionsSection from './components/AdmissionsSection.jsx';
import ContactSection from './components/ContactSection.jsx';
import Footer from './components/Footer.jsx';
import LoginModal from './components/LoginModal.jsx';
import DashboardLayout from './components/DashboardLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminDashboard from './components/dashboards/AdminDashboard.jsx';
import FacultyDashboard from './components/dashboards/FacultyDashboard.jsx';
import StudentDashboard from './components/dashboards/StudentDashboard.jsx';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeLoginModal, setActiveLoginModal] = useState(null);

  return (
    <Routes>
      {/* Main Homepage */}
      <Route path="/" element={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <Navigation 
            isMenuOpen={isMenuOpen}
            setIsMenuOpen={setIsMenuOpen}
            setActiveLoginModal={setActiveLoginModal}
          />
          
          <HeroSection />
          <ProgramsSection />
          <AdmissionsSection />
          <ContactSection />
          <Footer />

          {/* Login Modals */}
          <LoginModal 
            type="student" 
            isOpen={activeLoginModal === 'student'} 
            onClose={() => setActiveLoginModal(null)} 
          />
          <LoginModal 
            type="faculty" 
            isOpen={activeLoginModal === 'faculty'} 
            onClose={() => setActiveLoginModal(null)} 
          />
          <LoginModal 
            type="admin" 
            isOpen={activeLoginModal === 'admin'} 
            onClose={() => setActiveLoginModal(null)} 
          />
        </div>
      } />

      {/* Dashboard Routes */}
      <Route path="/apply" element={<ApplicationForm />} />
      <Route path="/programs" element={<ProgramsPage />} />
      
      <Route path="/dashboard/student" element={
        <ProtectedRoute requiredRole="student">
          <DashboardLayout>
            <StudentDashboard />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/dashboard/faculty" element={
        <ProtectedRoute requiredRole="faculty">
          <DashboardLayout>
            <FacultyDashboard />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/dashboard/admin" element={
        <ProtectedRoute requiredRole="admin">
          <DashboardLayout>
            <AdminDashboard />
          </DashboardLayout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;