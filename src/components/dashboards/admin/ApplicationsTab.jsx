import React, { useState, useEffect } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';
import { adminAPI } from '../../../services/api';
import ApplicationCard from './ApplicationCard';
import SearchFilters from './SearchFilters';

export default function ApplicationsTab() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('');

  // Modal state
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getApplications();
      setApplications(response.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch applications. Please try again later.');
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (applicationId, newStatus) => {
    try {
      await adminAPI.updateApplicationStatus(applicationId, newStatus);
      await fetchApplications(); // Refresh the list
      // Show success toast or notification
    } catch (err) {
      console.error('Error updating application status:', err);
      // Show error toast or notification
    }
  };

  const handleMarkAsPaid = async (applicationId) => {
    try {
      await adminAPI.markApplicationAsPaid(applicationId);
      await fetchApplications(); // Refresh the list
      // Show success toast or notification
    } catch (err) {
      console.error('Error marking application as paid:', err);
      // Show error toast or notification
    }
  };

  const handleSendEmail = async (application) => {
    try {
      await adminAPI.sendPaymentEmail(application.id);
      // Show success toast or notification
    } catch (err) {
      console.error('Error sending payment email:', err);
      // Show error toast or notification
    }
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setIsModalOpen(true);
  };

  // Filter applications based on search and filter criteria
  const filteredApplications = applications.filter(app => {
    const matchesSearch = !searchTerm || 
      app.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.courseName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !selectedStatus || app.status === selectedStatus;
    
    const matchesPayment = !selectedPaymentStatus || 
      app.paymentStatus === selectedPaymentStatus;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <FileText className="h-7 w-7 mr-3" />
            Application Management
          </h2>
          <button
            onClick={() => {}} // Implement export functionality
            className="flex items-center px-4 py-2 bg-white text-purple-600 rounded-xl hover:bg-blue-50 transition-colors font-medium shadow-lg"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        </div>

        <SearchFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          selectedPaymentStatus={selectedPaymentStatus}
          setSelectedPaymentStatus={setSelectedPaymentStatus}
        />
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <div className="text-center p-8">
            <p className="text-red-500 font-medium">{error}</p>
            <button
              onClick={fetchApplications}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Applications Grid */}
            <div className="grid gap-6 xl:grid-cols-2">
              {filteredApplications.map(application => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  onViewDetails={handleViewDetails}
                  onUpdateStatus={handleUpdateStatus}
                  onSendEmail={handleSendEmail}
                  onMarkAsPaid={handleMarkAsPaid}
                />
              ))}
            </div>

            {/* No Results Message */}
            {filteredApplications.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">No applications found matching your criteria.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Application Details Modal */}
      {isModalOpen && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Application Details</h2>
            {/* Add detailed application information here */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}