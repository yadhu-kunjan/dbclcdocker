import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Menu, X, User, Users, Shield } from 'lucide-react';

const Navigation = ({ isMenuOpen, setIsMenuOpen, setActiveLoginModal }) => {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center">
              <img 
                src="logo.png" 
                alt="DBCLC Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  // Fallback to icon if image fails to load
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg flex items-center justify-center" style={{display: 'none'}}>
                <GraduationCap className="text-white" size={24} />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">DBCLC</h1>
              <p className="text-xs text-gray-600">Institute of Theology</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection('home')}
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Home
            </button>
            <Link 
              to="/programs"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Programs
            </Link>
            <button 
              onClick={() => scrollToSection('admissions')}
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Admissions
            </button>
            <button 
              onClick={() => scrollToSection('contact')}
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Contact
            </button>
          </div>

          {/* Login Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={() => setActiveLoginModal('student')}
              className="flex items-center space-x-2  bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <User size={16} />
              <span className="text-sm font-medium">Student</span>
            </button>
            <button
              onClick={() => setActiveLoginModal('faculty')}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Users size={16} />
              <span className="text-sm font-medium">Faculty</span>
            </button>
            <button
              onClick={() => setActiveLoginModal('admin')}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Shield size={16} />
              <span className="text-sm font-medium">Admin</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <button 
                onClick={() => scrollToSection('home')}
                className="text-left text-gray-700 hover:text-blue-600 font-medium py-2"
              >
                Home
              </button>
              <Link 
                to="/programs"
                className="text-left text-gray-700 hover:text-blue-600 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Programs
              </Link>
              <button 
                onClick={() => scrollToSection('admissions')}
                className="text-left text-gray-700 hover:text-blue-600 font-medium py-2"
              >
                Admissions
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="text-left text-gray-700 hover:text-blue-600 font-medium py-2"
              >
                Contact
              </button>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => {
                      setActiveLoginModal('student');
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50 transition-all"
                  >
                    <User size={16} />
                    <span className="text-sm font-medium">Student Login</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveLoginModal('faculty');
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50 transition-all"
                  >
                    <Users size={16} />
                    <span className="text-sm font-medium">Faculty Login</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveLoginModal('admin');
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Shield size={16} />
                    <span className="text-sm font-medium">Admin Login</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;