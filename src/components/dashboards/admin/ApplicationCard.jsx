import React from 'react';
import { CheckCircle, XCircle, Eye, Mail, CreditCard } from 'lucide-react';
import { getInitials } from './AdminDashboardHeader';

export default function ApplicationCard({ 
  application, 
  onViewDetails,
  onUpdateStatus,
  onSendEmail,
  onMarkAsPaid 
}) {
  return (
    <div className="border-2 border-gray-100 rounded-2xl p-6 hover:border-blue-200 hover:shadow-lg transition-all bg-gradient-to-br from-white to-gray-50">
      {/* Card Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shrink-0">
            {getInitials(application?.candidateName)}
          </div>
          <div>
            <h3 className="font-bold text-xl text-gray-900">
              {application.candidateName || 'N/A'}
            </h3>
            <p className="text-sm text-gray-600">
              {application.courseName} - {application.courseFee}
            </p>
          </div>
        </div>
        
        {/* Status Badge */}
        <div className="flex flex-col items-end space-y-2">
          <span className={`px-4 py-2 rounded-full text-xs font-bold shadow-md ${
            application.status === 'pending' ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white' :
            application.status === 'approved' ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white' :
            'bg-gradient-to-r from-red-400 to-pink-500 text-white'
          }`}>
            {application.status.toUpperCase()}
          </span>
          
          {application.status === 'approved' && (
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              application.paymentStatus === 'paid' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {application.paymentStatus === 'paid' ? 'PAID' : 'Payment Pending'}
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
        {application.status === 'pending' && (
          <>
            <button
              onClick={() => onUpdateStatus(application.id, 'approved')}
              className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </button>
            <button
              onClick={() => onUpdateStatus(application.id, 'rejected')}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </button>
          </>
        )}
        
        {application.status === 'approved' && application.paymentStatus === 'unpaid' && (
          <>
            <button
              onClick={() => onSendEmail(application)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              <Mail className="h-4 w-4 mr-2" />
              Send Payment Email
            </button>
            <button
              onClick={() => onMarkAsPaid(application.id)}
              className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Mark as Paid
            </button>
          </>
        )}
        
        <button 
          onClick={() => onViewDetails(application)}
          className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
        >
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </button>
      </div>

      {/* Submission Time */}
      <div className="text-xs text-gray-400 mt-3">
        Submitted: {new Date(application.submittedAt).toLocaleString('en-IN')}
      </div>
    </div>
  );
}