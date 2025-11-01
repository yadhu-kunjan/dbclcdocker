import React from 'react';
import { Link } from 'react-router-dom';
import { Quote, BookOpen, ArrowRight, Calendar, GraduationCap, Globe, ShieldCheck } from 'lucide-react';
import ImageSlideshow from './ImageSlideshow';

const HeroSection = () => {
  return (
    <section id="home" className="relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-purple-200/40 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-blue-50/50 to-white" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20">
        {/* Image Slideshow - Moved to top */}
        <div className="mb-12">
          <ImageSlideshow />
        </div>

        {/* Action Buttons */}
        <div className="text-center mb-12">
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/programs" className=" inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              <BookOpen className="h-5 w-5" />
              <span>Explore Programs</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link to="/apply" className="inline-flex items-center justify-center space-x-2 border-2 border-blue-600 text-blue-700 px-8 py-4 rounded-xl font-semibold hover:bg-blue-600 hover:text-white transition-all">
              <Calendar className="h-5 w-5" />
              <span>Start Application</span>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-100">
            <div className="text-3xl font-extrabold text-blue-600 mb-1">500+</div>
            <div className="text-gray-600 text-sm">Students</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-100">
            <div className="text-3xl font-extrabold text-green-600 mb-1">50+</div>
            <div className="text-gray-600 text-sm">Faculty</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-100">
            <div className="text-3xl font-extrabold text-purple-600 mb-1">75+</div>
            <div className="text-gray-600 text-sm">Years</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-100">
            <div className="text-3xl font-extrabold text-orange-600 mb-1">95%</div>
            <div className="text-gray-600 text-sm">Placement</div>
          </div>
        </div>


        {/* Program Pillars - Reduced to 2 columns */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all">
            <div className="flex items-center mb-3">
              <div className="p-3 rounded-xl bg-blue-50 text-blue-700 mr-3"><GraduationCap className="h-5 w-5" /></div>
              <h3 className="text-lg font-semibold text-gray-900">Biblically Grounded</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">Rigorous study of Scripture, historic doctrine, and faithful practice for Christ-centered formation.</p>
          </div>
          <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all">
            <div className="flex items-center mb-3">
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 mr-3"><ShieldCheck className="h-5 w-5" /></div>
              <h3 className="text-lg font-semibold text-gray-900">Mentored Excellence</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">Learn alongside experienced faculty dedicated to scholarship, discipleship, and pastoral care.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;