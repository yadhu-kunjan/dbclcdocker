import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, User, MapPin, BookOpen, Calendar, Users, Globe, GraduationCap, Mail, Phone, Shield, Camera, Upload, X, FileText } from 'lucide-react';
import { useApplications } from '../contexts/ApplicationContext';
import api from '../services/api';

const ApplicationForm = () => {
  const navigate = useNavigate();
  const { submitApplication } = useApplications();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/courses');
        if (response.data.success) {
          setCourses(response.data.courses);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCourses([]);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  const [formData, setFormData] = useState({
    candidateName: '',
    fullAddress: '',
    courseName: '',
    dateOfBirth: '',
    fatherName: '',
    religion: 'Christian',
    caste: '',
    nationality: '',
    email: '',
    mobileNo: '',
    superintendentOfServer: ''
  });
  
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [certificates, setCertificates] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCourseSelection = (e) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    setFormData(prev => ({
      ...prev,
      courseName: selected[0] || ''
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      if (file.size > 500 * 1024) {
        alert('File size must be less than 500KB');
        return;
      }
      
      setPhoto(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCertificatesChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Please select a PDF file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      setCertificates(file);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
  };

  const removeCertificates = () => {
    setCertificates(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.courseName) {
      alert('Please select a course');
      return;
    }
    
    if (!certificates) {
      alert('Please upload your degree and grade certificates');
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Create FormData for multipart/form-data submission
      const formDataToSend = new FormData();
      
      // Append all text fields
      formDataToSend.append('candidateName', formData.candidateName);
      formDataToSend.append('fullAddress', formData.fullAddress);
  // single-course selection
  formDataToSend.append('courseName', formData.courseName);
      formDataToSend.append('dateOfBirth', formData.dateOfBirth);
      formDataToSend.append('fatherName', formData.fatherName);
      formDataToSend.append('religion', formData.religion);
      formDataToSend.append('caste', formData.caste);
      formDataToSend.append('nationality', formData.nationality);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('mobileNo', formData.mobileNo);
      formDataToSend.append('superintendentOfServer', formData.superintendentOfServer);
      
      // Append files
      if (photo) {
        formDataToSend.append('photo', photo);
      }
      if (certificates) {
        formDataToSend.append('certificates', certificates);
      }
      
      // Submit to API
      const response = await api.post('/applications', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        alert('Application submitted successfully! You will receive a confirmation email shortly.');
        navigate('/');
      } else {
        alert('Failed to submit application. Please try again.');
      }
    } catch (error) {
      console.error('Application submission error:', error);
      alert('Failed to submit application. Please try again.');
    }
    
    setIsSubmitting(false);
  };

  const casteOptions = [
    'Forward Caste (FC)',
    'Other Backward Class (OBC)',
    'Scheduled Caste (SC)',
    'Scheduled Tribe (ST)'
  ];

  const formFields = [
    {
      name: 'candidateName',
      label: 'Full Name of Candidate',
      type: 'text',
      icon: User,
      placeholder: 'Enter your full name',
      required: true
    },
    {
      name: 'fullAddress',
      label: 'Full Address',
      type: 'textarea',
      icon: MapPin,
      placeholder: 'Enter your complete address with city, state, and postal code',
      required: true
    },
    {
      name: 'courseName',
      label: 'Select Course',
      type: 'select',
      icon: BookOpen,
      required: true,
      options: courses.map(course => course.title)
    },
    {
      name: 'dateOfBirth',
      label: 'Date of Birth',
      type: 'date',
      icon: Calendar,
      required: true
    },
    {
      name: 'fatherName',
      label: "Father's Name",
      type: 'text',
      icon: Users,
      placeholder: "Enter your father's full name",
      required: true
    },
    {
      name: 'religion',
      label: 'Religion',
      type: 'text',
      icon: Globe,
      placeholder: 'Religion',
      required: true,
      defaultValue: 'Christian'
    },
    {
      name: 'caste',
      label: 'Caste Category',
      type: 'select',
      icon: Users,
      required: true,
      options: casteOptions
    },
    {
      name: 'nationality',
      label: 'Nationality',
      type: 'text',
      icon: Globe,
      placeholder: 'Enter your nationality',
      required: true
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      icon: Mail,
      placeholder: 'Enter your email address',
      required: true
    },
    {
      name: 'mobileNo',
      label: 'Mobile Number',
      type: 'tel',
      icon: Phone,
      placeholder: 'Enter your mobile number',
      required: true
    },
    {
      name: 'superintendentOfServer',
      label: 'Superintendent of the Server',
      type: 'text',
      icon: Shield,
      placeholder: 'Enter the name of the superintendent',
      required: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft size={20} />
            <span>Back to Homepage</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Application Form</h1>
            <p className="text-xl text-gray-600">DBCLC Institute of Theology</p>
            <p className="text-gray-500">Please fill out all required fields to submit your application</p>
          </div>
        </div>

        {/* Application Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Photo Upload Section */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Camera className="w-5 h-5 mr-2 text-blue-600" />
                Student Photo
              </h3>
              <div className="flex items-center space-x-6">
                {/* Photo Preview */}
                <div className="flex-shrink-0">
                  {photoPreview ? (
                    <div className="relative">
                      <img
                        src={photoPreview}
                        alt="Photo preview"
                        className="w-24 h-24 rounded-lg object-cover border-2 border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                      <Camera className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                
                {/* Upload Button */}
                <div className="flex-1">
                  <label className="cursor-pointer">
                    <div className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
                      <Upload className="w-5 h-5" />
                      <span className="font-medium">
                        {photo ? 'Change Photo' : 'Upload Photo'}
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-sm text-gray-500 mt-1">
                    {photo ? `${photo.name} (${(photo.size / 1024).toFixed(0)}KB)` : 'JPG, PNG, or GIF. Max 500KB.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Certificates Upload Section */}
            <div className="bg-yellow-50 rounded-lg p-6 mb-6 border-2 border-yellow-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-yellow-600" />
                Educational Qualification <span className="text-red-500 ml-1">*</span>
              </h3>
              <div className="flex items-center space-x-6">
                {/* Certificate Icon/Preview */}
                <div className="flex-shrink-0">
                  {certificates ? (
                    <div className="relative">
                      <div className="w-24 h-24 bg-red-100 rounded-lg flex items-center justify-center border-2 border-red-300">
                        <FileText className="w-12 h-12 text-red-600" />
                      </div>
                      <button
                        type="button"
                        onClick={removeCertificates}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                
                {/* Upload Button */}
                <div className="flex-1">
                  <label className="cursor-pointer">
                    <div className="flex items-center space-x-2 text-yellow-700 hover:text-yellow-800">
                      <Upload className="w-5 h-5" />
                      <span className="font-medium">
                        {certificates ? 'Change Certificates' : 'Upload Degree & Grade Certificates'}
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleCertificatesChange}
                      className="hidden"
                      required
                    />
                  </label>
                  <p className="text-sm text-gray-600 mt-1">
                    {certificates ? `${certificates.name} (${(certificates.size / 1024).toFixed(0)}KB)` : 'Upload all certificates in a single PDF file. Max 5MB.'}
                  </p>
                  <p className="text-xs text-yellow-700 mt-2">
                    Please combine your degree certificate and grade certificates into one PDF file before uploading.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formFields.map((field) => {
                const Icon = field.icon;
                
                return (
                  <div key={field.name} className={field.type === 'textarea' || field.type === 'multiselect' ? 'md:col-span-2' : ''}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center space-x-2">
                        <Icon size={16} className="text-blue-600" />
                        <span>{field.label}</span>
                        {field.required && <span className="text-red-500">*</span>}
                      </div>
                    </label>
                    
                    {field.type === 'multiselect' ? (
                      <div>
                        <select
                          name={field.name}
                          multiple
                          value={formData.selectedCourses}
                          onChange={handleCourseSelection}
                          required={field.required}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          style={{ minHeight: '120px' }}
                        >
                          {field.options?.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          Hold Ctrl (Windows) or Cmd (Mac) to select multiple courses
                        </p>
                        {formData.selectedCourses.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {formData.selectedCourses.map(course => (
                              <span key={course} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                {course}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : field.type === 'select' ? (
                      <select
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleInputChange}
                        required={field.required}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select {field.label.toLowerCase()}</option>
                        {field.options?.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleInputChange}
                        placeholder={field.placeholder}
                        required={field.required}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    ) : (
                      <input
                        type={field.type}
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleInputChange}
                        placeholder={field.placeholder}
                        required={field.required}
                        readOnly={field.name === 'religion'}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Terms and Conditions */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Declaration</h3>
              <p className="text-sm text-gray-600 mb-4">
                I hereby declare that the information provided above is true and correct to the best of my knowledge. 
                I understand that any false information may lead to the rejection of my application or cancellation of admission.
              </p>
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  required
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  I agree to the terms and conditions and confirm that all information provided is accurate.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-700 text-white px-8 py-4 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Send size={20} />
                <span>{isSubmitting ? 'Submitting Application...' : 'Submit Application'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm;