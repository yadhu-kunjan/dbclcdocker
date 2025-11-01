import React, { createContext, useContext, useState, useEffect } from 'react';
import { applicationAPI } from '../services/api.js';

const ApplicationContext = createContext();

export const useApplications = () => {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error('useApplications must be used within an ApplicationProvider');
  }
  return context;
};

export const ApplicationProvider = ({ children }) => {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const mapDbRowToApplication = (row) => {
    if (!row) return null;
    return {
      id: String(row.id ?? row.id),
      candidateName: row.candidate_name,
      fullAddress: row.full_address,
      courseName: row.course_name,
      dateOfBirth: row.date_of_birth,
      fatherName: row.father_name,
      religionCaste: row.religion_caste,
      nationality: row.nationality,
      educationalQualification: row.educational_qualification,
      email: row.email,
      mobileNo: row.mobile_no,
      superintendentOfServer: row.superintendent_of_server,
      photoPath: row.photo_path,
      status: row.status || 'pending',
      submittedAt: row.created_at || new Date().toISOString(),
    };
  };

  // Load applications on mount
  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setIsLoading(true);
    try {
      const response = await applicationAPI.getAll();
      if (response.success) {
        const mapped = (response.applications || []).map(mapDbRowToApplication).filter(Boolean);
        setApplications(mapped);
      }
    } catch (error) {
      // Backend not available - start with empty applications
      setApplications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const submitApplication = async (applicationData, photo = null) => {
    try {
      const response = await applicationAPI.submit(applicationData, photo);
      
      if (response.success) {
        const newApplication = mapDbRowToApplication(response.application) || {
          ...applicationData,
          id: `app_${Date.now()}`,
          submittedAt: new Date().toISOString(),
          status: 'pending',
        };
        
        setApplications(prev => [...prev, newApplication]);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error submitting application:', error);
      return false;
    }
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      const response = await applicationAPI.updateStatus(applicationId, newStatus);
      
      if (response.success) {
        setApplications(prev => 
          prev.map(app => 
            app.id === applicationId 
              ? { ...app, status: newStatus }
              : app
          )
        );
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error updating application status:', error);
      return false;
    }
  };

  const value = {
    applications,
    isLoading,
    submitApplication,
    updateApplicationStatus,
    loadApplications
  };

  return (
    <ApplicationContext.Provider value={value}>
      {children}
    </ApplicationContext.Provider>
  );
};