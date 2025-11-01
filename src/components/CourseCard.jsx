import React from 'react';

const CourseCard = ({ course }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1">
    <div className="flex justify-between items-start mb-4">
      <div className="flex-1">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{course.title}</h3>
        <p className="text-gray-600 text-sm mb-3">{course.description}</p>
      </div>
      <div className="ml-4 text-right">
        <div className="text-2xl font-bold text-blue-600">{course.duration}</div>
        <div className="text-sm text-gray-500">Duration</div>
      </div>
    </div>

    <div className="mb-4">
      <h4 className="font-semibold text-sm text-gray-700 mb-2">Key Subjects:</h4>
      <div className="flex flex-wrap gap-2">
        {(course.subjects || []).map((subject, index) => (
          <span 
            key={index} 
            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
          >
            {subject}
          </span>
        ))}
      </div>
    </div>

    <div className="flex justify-between items-center pt-4 border-t">
      <div>
        <div className="text-lg font-bold text-green-600">{course.fee}</div>
        <div className="text-sm text-gray-500">Intake: {course.intake}</div>
      </div>
      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
        Learn More
      </button>
    </div>
  </div>
);

export default CourseCard;