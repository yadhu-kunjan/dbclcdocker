import React, { useState, useEffect } from 'react';
import { Users, DollarSign, Clock, CreditCard, UserCheck, Lock, ClipboardList, BookOpen, Loader2 } from 'lucide-react';
import { adminAPI } from '../../services/api.js';
import AdminDashboardHeader from './admin/AdminDashboardHeader';
import WelcomeBanner from './admin/WelcomeBanner';
import { StatisticsGrid } from './admin/StatisticsCards';
import TabNavigation from './admin/TabNavigation';
import ApplicationsTab from './admin/ApplicationsTab';
import LoginManagementTab from './admin/LoginManagementTab';
import AcademicTab from './admin/AcademicTab';

export default function AdminDashboard() {
  // Core dashboard state
  const [activeTab, setActiveTab] = useState('logins');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dashboard data state
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    awaitingPayment: 0,
    fullyEnrolled: 0,
    totalRevenue: 0,
    paidCount: 0
  });
  
  const [adminSettings, setAdminSettings] = useState({
    institution_name: 'DBCLC Institute of Theology',
    admin_name: 'Dr. Sarah Johnson',
    admin_role: 'Super Administrator',
    admin_email: 'sarah.johnson@dbclc.edu'
  });

  // Load initial dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsResponse, settingsResponse] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getSettings()
      ]);
      
      if (statsResponse.success) {
        setStats(statsResponse.stats);
      } else {
        throw new Error('Failed to load admin stats');
      }
      
      if (settingsResponse.success && settingsResponse.settings) {
        setAdminSettings(settingsResponse.settings);
      } else {
        throw new Error('Failed to load admin settings');
      }
      
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Create adminProfile object for child components
  const adminProfile = {
    name: adminSettings.admin_name || "Dr. Sarah Johnson",
    role: adminSettings.admin_role || "Super Administrator",
    email: adminSettings.admin_email || "sarah.johnson@dbclc.edu",
    institution: adminSettings.institution_name || "DBCLC Institute of Theology",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-500 font-medium mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <AdminDashboardHeader adminProfile={adminProfile} />

      {/* Welcome Banner */}
      <WelcomeBanner adminProfile={adminProfile} stats={stats} />
      
      {/* Statistics Section */}
      <StatisticsGrid
        stats={[
          {
            name: 'Total Applications',
            value: (stats.approved + stats.pending + stats.rejected).toString(),
            icon: Users,
            color: 'from-blue-500 to-cyan-500',
            change: 'All time'
          },
          {
            name: 'Pending Review',
            value: stats.pending.toString(),
            icon: Clock,
            color: 'from-amber-500 to-orange-500',
            change: 'Action Required'
          },
          {
            name: 'Awaiting Payment',
            value: stats.awaitingPayment.toString(),
            icon: CreditCard,
            color: 'from-blue-500 to-blue-600',
            change: 'Send Reminders'
          },
          {
            name: 'Total Enrolled',
            value: stats.fullyEnrolled.toString(),
            icon: UserCheck,
            color: 'from-emerald-500 to-teal-500',
            change: 'Active Students'
          },
          {
            name: 'Total Revenue',
            value: `₹${(stats.totalRevenue / 100000).toFixed(2)}L`,
            icon: DollarSign,
            color: 'from-purple-500 to-pink-500',
            change: `${stats.paidCount} paid`
          }
        ]}
      />

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <TabNavigation
          tabs={[
            { id: 'logins', label: 'Login Management', icon: Lock },
            { id: 'academic', label: 'Academic Management', icon: BookOpen },
            { id: 'applications', label: 'Applications', icon: ClipboardList }
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="mt-6">
          {activeTab === 'logins' ? (
            <LoginManagementTab />
          ) : activeTab === 'academic' ? (
            <AcademicTab />
          ) : (
            <ApplicationsTab onStatsChange={loadDashboardData} />
          )}
        </div>
      </div>
    </div>
  );
}

