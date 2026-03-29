import React from 'react';
import { useNavigate, Link } from 'react-router';
import { Mail } from 'lucide-react';

export function ForgotPasswordPage() {
  const navigate = useNavigate();

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate password reset request and redirect to reset password page
    navigate('/reset-password');
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-100 font-sans p-4 sm:p-8">
      <div className="flex w-full max-w-[1000px] min-h-[600px] bg-white rounded-[32px] shadow-2xl overflow-hidden">
        {/* Left Column - Image Placeholder */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-slate-200">
          <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center text-slate-400">
            <svg className="w-16 h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="font-medium text-lg">Image Placeholder</span>
          </div>
          {/* Subtle teal gradient overlay to match the design's left side */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#1E847C]/40 to-[#12504b]/80 mix-blend-multiply pointer-events-none" />
        </div>

        {/* Right Column - Forgot Password Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16 bg-white">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h1 className="text-[28px] font-bold text-slate-900 tracking-tight mb-2">Forgot Password?</h1>
              <p className="text-slate-500 text-sm leading-relaxed">
                If you forgot your password, well, then we'll email you instructions to reset your password.
              </p>
            </div>

            <form onSubmit={handleReset} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-800">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E847C]/20 focus:border-[#1E847C] transition-all placeholder:text-slate-400"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <Mail className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#1E847C] hover:bg-[#156a63] text-white font-medium rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#1E847C]/50 focus:ring-offset-2"
              >
                Send Instructions
              </button>
            </form>

            <div className="mt-8 text-center text-sm">
              <span className="text-slate-500">Return to </span>
              <Link to="/" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                Log in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
