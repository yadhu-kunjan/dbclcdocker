import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CourseCard from './CourseCard';
import api from '../services/api';

const ProgramsSection = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Add cache-busting parameter to ensure fresh data
        const response = await api.get('/courses', {
          params: { _t: Date.now() }
        });
        if (response.data.success) {
          setCourses(response.data.courses);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        // Fallback to static data if API fails
        const { courses: staticCourses } = await import('../data/courses');
        setCourses(staticCourses);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Show only the first 3 courses on the home page
  const featuredCourses = courses.slice(0, 3);

  if (loading) {
    return (
      <section id="courses" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Academic Programs</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Loading programs...
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="courses" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Academic Programs</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive theological education from undergraduate to doctoral levels
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {featuredCourses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        {/* View All Programs Button */}
        <div className="text-center">
          <Link 
            to="/programs"
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            <span>View All Programs</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProgramsSection;