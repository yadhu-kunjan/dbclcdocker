import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, User, MapPin, BookOpen, Calendar, Users, Globe, GraduationCap, Mail, Phone, Shield, Camera, Upload, X } from 'lucide-react';
import { useApplications } from '../contexts/ApplicationContext';
import { courses } from '../data/courses';

const ApplicationForm = () => {
  const navigate = useNavigate();
  const { submitApplication } = useApplications();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    candidateName: '',
    fullAddress: '',
    courseName: '',
    dateOfBirth: '',
    fatherName: '',
    religionCaste: '',
    nationality: '',
    educationalQualification: '',
    email: '',
    mobileNo: '',
    superintendentOfServer: ''
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (500KB max)
      if (file.size > 500 * 1024) {
        alert('File size must be less than 500KB');
        return;
      }
      
      setPhoto(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    console.log('Submitting application with photo:', photo);
    console.log('Form data:', formData);

    try {
      const success = await submitApplication(formData, photo);
      
      if (success) {
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
      label: 'Course Name',
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
      name: 'religionCaste',
      label: 'Religion/Caste',
      type: 'text',
      icon: Globe,
      placeholder: 'Enter your religion and caste',
      required: true
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
      name: 'educationalQualification',
      label: 'Educational Qualification',
      type: 'textarea',
      icon: GraduationCap,
      placeholder: 'Enter your highest educational qualification with institution name and year',
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formFields.map((field) => {
                const Icon = field.icon;
                
                return (
                  <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center space-x-2">
                        <Icon size={16} className="text-blue-600" />
                        <span>{field.label}</span>
                        {field.required && <span className="text-red-500">*</span>}
                      </div>
                    </label>
                    
                    {field.type === 'select' ? (
                      <select
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleInputChange}
                        required={field.required}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select a course</option>
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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