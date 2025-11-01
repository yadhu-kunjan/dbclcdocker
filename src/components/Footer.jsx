import React from 'react';
import { GraduationCap } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
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
              <h3 className="text-xl font-bold">DBCLC</h3>
            </div>
            <p className="text-gray-400">
              Preparing faithful leaders for tomorrow's church through excellence in theological education.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white">Programs</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Admissions</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Faculty</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Campus Life</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white">Library</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Online Learning</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Student Support</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Career Services</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Connect</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white">Contact Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">News & Events</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Alumni</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Support</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 DBCLC Institute of Theology. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;