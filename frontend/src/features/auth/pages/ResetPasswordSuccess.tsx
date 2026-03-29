import React from 'react';
import { useNavigate } from 'react-router';
import { Check } from 'lucide-react';

export function ResetSuccessPage() {
  const navigate = useNavigate();

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

        {/* Right Column - Success Message */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16 bg-white">
          <div className="w-full max-w-sm flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-[#16a34a] rounded-full flex items-center justify-center mb-6 shadow-sm">
              <Check className="w-8 h-8 text-white" strokeWidth={3} />
            </div>

            <h1 className="text-[28px] font-bold text-[#1e293b] tracking-tight mb-2">Success</h1>
            <p className="text-slate-500 text-sm mb-8">
              Your Password Reset Successfully
            </p>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full py-2.5 px-4 bg-[#1E847C] hover:bg-[#156a63] text-white font-medium rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#1E847C]/50 focus:ring-offset-2"
            >
              Back to Log in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
