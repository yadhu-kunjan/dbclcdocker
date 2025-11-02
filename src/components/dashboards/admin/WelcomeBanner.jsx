import React from 'react';
import { Users, DollarSign, TrendingUp, AlertCircle, FileText, CheckCircle, XCircle, Clock, Search, Download, Mail, Phone, MapPin, Calendar, Shield, Activity, Briefcase, CreditCard, Eye } from 'lucide-react';

export default function WelcomeBanner({ adminProfile, stats }) {
  return (
    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl overflow-hidden">
      <div className="p-8 text-white relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-white" />
              <div>
                <p className="text-xs text-blue-100">Access Level</p>
                <p className="font-semibold">{adminProfile.role}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center space-x-3">
              <Activity className="h-8 w-8 text-white" />
              <div>
                <p className="text-xs text-blue-100">Pending Tasks</p>
                <p className="font-semibold">{stats.pending} Applications</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center space-x-3">
              <Briefcase className="h-8 w-8 text-white" />
              <div>
                <p className="text-xs text-blue-100">Payment Pending</p>
                <p className="font-semibold">{stats.awaitingPayment} Students</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}