import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { admissionRequirements } from '../data/admissions';

const AdmissionsSection = () => {
  const navigate = useNavigate();
  
  const applicationSteps = [
    "Submit online application",
    "Upload required documents",
    "Pay application fee ($50)",
    "Schedule interview (if required)",
    "Await admission decision",
    "Complete enrollment process"
  ];

  return (
    <section id="admissions" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Admissions</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Begin your journey in theological education with us
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Application Process</h3>
            <div className="space-y-4">
              {applicationSteps.map((step, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <span className="text-gray-700">{step}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {admissionRequirements.map((req, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                <h4 className="text-xl font-bold text-gray-800 mb-4">{req.program}</h4>
                <ul className="space-y-2">
                  {req.requirements.map((requirement, reqIndex) => (
                    <li key={reqIndex} className="flex items-start space-x-2">
                      <CheckCircle className="text-green-600 mt-1 flex-shrink-0" size={16} />
                      <span className="text-gray-600 text-sm">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <button 
            onClick={() => navigate('/apply')}
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Apply Now
          </button>
        </div>
      </div>
    </section>
  );
};

export default AdmissionsSection;