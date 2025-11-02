import React from 'react';
import { Search, Filter } from 'lucide-react';

export default function SearchFilters({ 
  searchTerm,
  setSearchTerm,
  selectedStatus,
  setSelectedStatus,
  selectedPaymentStatus,
  setSelectedPaymentStatus
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 mb-6">
      {/* Search Box */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or course..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-100 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
        />
      </div>

      {/* Application Status Filter */}
      <div className="relative">
        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-100 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all appearance-none bg-white"
        >
          <option value="">All Application Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Payment Status Filter */}
      <div className="relative">
        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <select
          value={selectedPaymentStatus}
          onChange={(e) => setSelectedPaymentStatus(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-100 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all appearance-none bg-white"
        >
          <option value="">All Payment Status</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
        </select>
      </div>
    </div>
  );
}