import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 font-sans">
      {/* Decorative blobs for premium feel */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-purple-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <ShieldCheck size={24} />
          </div>
          <span className="text-2xl font-bold text-slate-900 tracking-tight">TaskRipple</span>
        </div>
        <div className="hidden md:flex gap-6 items-center">
          <Link to="/login" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">
            Sign In
          </Link>
          <Link 
            to="/register" 
            className="px-6 py-2.5 bg-slate-900 text-white rounded-full font-medium hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 relative z-10 text-center pb-16">
        
        {/* Headlines */}
        <div className="max-w-4xl mx-auto mb-12 space-y-6">
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Master Your Time. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Maximize Your Earnings.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-light">
            The next-generation platform for completing tasks, tracking rewards, and growing your network with ease.
          </p>
        </div>

        {/* Glass Card */}
        <div className="relative w-full max-w-lg mx-auto">
          {/* Card Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[35px] blur opacity-20"></div>
          
          <div className="relative backdrop-blur-2xl bg-white/60 border border-white/60 rounded-[30px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-12 flex flex-col items-center text-center">
            
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-800 mb-3">Join the Ecosystem</h3>
              <p className="text-slate-600 leading-relaxed">
                Experience a seamless dashboard to manage tasks, track referrals, and withdraw earnings instantly.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <Link 
                to="/register" 
                className="flex-1 group flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-semibold transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 hover:-translate-y-0.5"
              >
                Sign Up
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              
              <Link 
                to="/login" 
                className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-white/50 text-indigo-900 border border-white/60 rounded-2xl font-semibold transition-all hover:bg-white/80 hover:shadow-sm hover:-translate-y-0.5"
              >
                Log In
              </Link>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
};