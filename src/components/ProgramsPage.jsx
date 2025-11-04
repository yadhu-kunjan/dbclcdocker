import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, Award, Filter, Search, Star, ChevronDown, ChevronUp, ArrowLeft, Home, TrendingUp, Users } from 'lucide-react';
import api from '../services/api';

const ProgramsPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [sortBy, setSortBy] = useState('title');
  const [showFilters, setShowFilters] = useState(false);

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

  const levels = ['All', 'Certificate', 'Associate', 'Undergraduate', 'Graduate', 'Doctoral'];

  const filteredCourses = courses
    .filter(course => 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.subjects.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .filter(course => selectedLevel === 'All' || course.level === selectedLevel)
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'duration':
          return parseInt(a.duration) - parseInt(b.duration);
        case 'fee':
          return parseInt(a.fee.replace(/[$,]/g, '')) - parseInt(b.fee.replace(/[$,]/g, ''));
        case 'credits':
          return a.credits - b.credits;
        default:
          return 0;
      }
    });

  const CourseCard = ({ course }) => {
    return (
      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-200 overflow-hidden">
        {/* Top Accent Bar */}
        <div className="h-1 bg-blue-600"></div>
        
        <div className="p-6">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white">
                {course.level}
              </span>
              {course.popularity === 'High' && (
                <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-300">
                  <TrendingUp className="h-3 w-3" />
                  Popular
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded border border-yellow-300">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span className="text-sm font-semibold">4.8</span>
            </div>
          </div>

          {/* Title */}
          <div className="mb-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <BookOpen className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 leading-tight pt-1">
                {course.title}
              </h3>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-4 leading-relaxed">
            {course.description}
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 border border-gray-200">
              <Clock className="h-4 w-4 text-gray-600" />
              <div>
                <div className="text-sm font-semibold text-gray-900">{course.duration}</div>
                <div className="text-xs text-gray-500">Duration</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 border border-gray-200">
              <Award className="h-4 w-4 text-gray-600" />
              <div>
                <div className="text-sm font-semibold text-gray-900">{course.credits} Credits</div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
            </div>
          </div>

          {/* Subjects */}
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Key Subjects
            </h4>
            <div className="flex flex-wrap gap-2">
              {course.subjects.slice(0, 3).map((subject, idx) => (
                <span 
                  key={idx} 
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium border border-gray-200"
                >
                  {subject}
                </span>
              ))}
              {course.subjects.length > 3 && (
                <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs font-medium">
                  +{course.subjects.length - 3} more
                </span>
              )}
            </div>
          </div>

          {/* Fee and Intake */}
          <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {course.fee}
              </div>
              <div className="text-xs text-gray-500">Annual Tuition</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900">{course.intake}</div>
              <div className="text-xs text-gray-500 flex items-center gap-1 justify-end">
                <Users className="h-3 w-3" />
                Next Intake
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Apply Now
            </button>
            <button className="px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
              Details
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center py-16">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading programs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-gray-700 hover:bg-gray-50 transition-colors border border-gray-300 font-medium"
          >
            <ArrowLeft className="h-5 w-5" />
            <Home className="h-5 w-5" />
            <span>Back to Home</span>
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 rounded-full border border-blue-200 mb-4">
            <span className="font-semibold text-sm text-blue-900">{courses.length} Programs Available</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-gray-900">
            Academic Programs
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover our comprehensive range of theological and ministry programs designed to equip you for service in God's kingdom.
          </p>
        </div>

        {/* Search and Filters Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search programs, subjects, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            >
              <Filter className="h-5 w-5" />
              <span>Filters</span>
              {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Academic Level</label>
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {levels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="title">Title</option>
                    <option value="duration">Duration</option>
                    <option value="fee">Fee</option>
                    <option value="credits">Credits</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <div className="px-4 py-2 bg-blue-50 rounded-lg border border-blue-200 w-full">
                    <div className="text-sm font-semibold text-gray-700">
                      Showing <span className="text-blue-600">{filteredCourses.length}</span> of <span className="text-blue-600">{courses.length}</span> programs
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        {/* No Results */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
            <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
              <BookOpen className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No programs found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgramsPage;