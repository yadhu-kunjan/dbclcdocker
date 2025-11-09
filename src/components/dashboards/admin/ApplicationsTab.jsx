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

  // Email confirmation modal state
  const [emailConfirmation, setEmailConfirmation] = useState({
    isOpen: false,
    application: null,
    isSending: false,
    message: ''
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getApplications();
      console.log('Full Applications response:', response);
      console.log('Applications array:', response.applications);
      console.log('Applications count:', response.applications?.length);

      if (response.applications && Array.isArray(response.applications)) {
        setApplications(response.applications);
      } else {
        console.warn('No applications array in response');
        setApplications([]);
      }
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

  const handleSendEmail = (application) => {
    setEmailConfirmation({
      isOpen: true,
      application: application,
      isSending: false,
      message: ''
    });
  };

  const handleConfirmSendEmail = async () => {
    try {
      setEmailConfirmation(prev => ({ ...prev, isSending: true }));
      await adminAPI.sendPaymentEmail(emailConfirmation.application.id);
      setEmailConfirmation(prev => ({
        ...prev,
        message: 'Payment email sent successfully!',
        isSending: false
      }));
      // Auto close after 2 seconds
      setTimeout(() => {
        setEmailConfirmation({ isOpen: false, application: null, isSending: false, message: '' });
      }, 2000);
    } catch (err) {
      console.error('Error sending payment email:', err);
      setEmailConfirmation(prev => ({
        ...prev,
        message: 'Failed to send email. Please try again.',
        isSending: false
      }));
    }
  };

  const handleCancelEmail = () => {
    setEmailConfirmation({ isOpen: false, application: null, isSending: false, message: '' });
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Application Details</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Personal Information Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b-2 border-purple-200">
                Personal Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="font-medium text-gray-900">{selectedApplication.candidateName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{selectedApplication.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Mobile Number</p>
                  <p className="font-medium text-gray-900">{selectedApplication.mobileNo || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date of Birth</p>
                  <p className="font-medium text-gray-900">
                    {selectedApplication.dateOfBirth
                      ? new Date(selectedApplication.dateOfBirth).toLocaleDateString('en-IN')
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Family Information Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b-2 border-purple-200">
                Family Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Father's Name</p>
                  <p className="font-medium text-gray-900">{selectedApplication.fatherName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Nationality</p>
                  <p className="font-medium text-gray-900">{selectedApplication.nationality || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Religion/Caste</p>
                  <p className="font-medium text-gray-900">{selectedApplication.religionCaste || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Course Information Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b-2 border-purple-200">
                Course Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Course Name</p>
                  <p className="font-medium text-gray-900">{selectedApplication.courseName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Course Fee</p>
                  <p className="font-medium text-gray-900">{selectedApplication.courseFee || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Education Information Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b-2 border-purple-200">
                Educational Qualification
              </h3>
              <div>
                <p className="text-sm text-gray-600">Qualification</p>
                <p className="font-medium text-gray-900">{selectedApplication.educationalQualification || 'N/A'}</p>
              </div>
            </div>

            {/* Address Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b-2 border-purple-200">
                Address
              </h3>
              <div>
                <p className="text-sm text-gray-600">Full Address</p>
                <p className="font-medium text-gray-900">{selectedApplication.fullAddress || 'N/A'}</p>
              </div>
            </div>

            {/* Application Status Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b-2 border-purple-200">
                Application Status
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    selectedApplication.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                    selectedApplication.status === 'approved' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedApplication.status?.toUpperCase() || 'N/A'}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    selectedApplication.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedApplication.paymentStatus?.toUpperCase() || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Submission Date */}
            <div className="mb-6">
              <p className="text-sm text-gray-600">Submitted On</p>
              <p className="font-medium text-gray-900">
                {selectedApplication.submittedAt
                  ? new Date(selectedApplication.submittedAt).toLocaleString('en-IN')
                  : 'N/A'}
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="w-full mt-6 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Email Confirmation Modal */}
      {emailConfirmation.isOpen && emailConfirmation.application && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Send Payment Email</h2>
              <button
                onClick={handleCancelEmail}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {emailConfirmation.message ? (
              <div className={`p-4 rounded-xl text-center ${
                emailConfirmation.message.includes('successfully')
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                <p className="font-medium">{emailConfirmation.message}</p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <p className="text-gray-700 mb-4">
                    Send a payment reminder email to:
                  </p>
                  <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
                    <p className="font-bold text-gray-900">{emailConfirmation.application.candidateName}</p>
                    <p className="text-sm text-gray-600">{emailConfirmation.application.email}</p>
                    <p className="text-sm text-gray-600 mt-2">
                      <span className="font-semibold">Course:</span> {emailConfirmation.application.courseName}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Amount:</span> ₹{emailConfirmation.application.courseFee}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleCancelEmail}
                    disabled={emailConfirmation.isSending}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmSendEmail}
                    disabled={emailConfirmation.isSending}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {emailConfirmation.isSending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Email'
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}