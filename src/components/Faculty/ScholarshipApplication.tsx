import { useState } from 'react';
import { UploadCloud, Check, Info, ArrowLeft, ArrowRight, FileText, CheckCircle2 } from 'lucide-react';

const STEPS = [
  'Personal Details',
  'Academic Profile',
  'Scholarship Info',
  'Document Upload',
  'Find Schedule',
  'Review & Submit'
];

export const ScholarshipApplication = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (isSubmitted) {
    return (
      <div className="flex-1 bg-white rounded-lg shadow-sm border border-slate-200 p-8 md:p-16 flex flex-col items-center justify-center min-h-[600px] animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-4 text-center">Application Submitted!</h2>
        <p className="text-slate-500 text-center max-w-md mb-8">
          Thank you for applying. We have received your scholarship application. You will be notified of the results via email within 5-7 business days.
        </p>
        <button
          onClick={() => {
            setIsSubmitted(false);
            setCurrentStep(0);
          }}
          className="px-6 py-2.5 rounded-lg bg-[#1E847C] text-white font-medium hover:bg-[#156a63] transition-colors shadow-sm"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col xl:flex-row items-stretch w-full min-h-[600px] bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
      {/* Sidebar Stepper */}
      <div className="w-full xl:w-72 border-b xl:border-b-0 xl:border-r border-slate-200 p-6 md:p-8 flex-shrink-0 flex flex-col">
        <h3 className="font-bold text-slate-800 mb-8 text-lg">Application Form</h3>
        <div className="relative">
          {STEPS.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            const isLast = index === STEPS.length - 1;

            return (
              <div key={step} className="flex items-start gap-4 pb-10 relative last:pb-0">
                {/* Connecting Line */}
                {!isLast && (
                  <div
                    className={`absolute left-[11px] top-3 w-[2px] h-full ${
                      isCompleted ? 'bg-[#1E847C]' : 'bg-slate-200'
                    }`}
                  />
                )}

                {/* Circle */}
                <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-white transition-colors duration-300 ${
                  isActive || isCompleted ? 'border-2 border-[#1E847C]' : 'border-2 border-slate-200'
                }`}>
                  {isActive && <div className="w-2.5 h-2.5 rounded-full bg-[#1E847C]" />}
                </div>

                {/* Text */}
                <div className={`text-[13px] pt-0.5 transition-colors duration-300 ${
                  isActive ? 'text-slate-900 font-bold' :
                  isCompleted ? 'text-slate-600 font-medium' :
                  'text-slate-400 font-medium'
                }`}>
                  {step}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 md:p-10 w-full flex flex-col bg-white">
        {/* Header */}
        <div className="pb-6 mb-8 border-b border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-slate-800">{STEPS[currentStep]}</h2>
            <span className="text-slate-400 text-[15px] font-medium bg-slate-50 px-3 py-1 rounded-full border border-slate-100">Step {currentStep + 1} of {STEPS.length}</span>
          </div>
          <p className="text-slate-500 text-[14px]">
            {currentStep === 0 && "Please provide your complete personal information in both English and Spanish."}
            {currentStep === 1 && "Enter your academic history and current standing."}
            {currentStep === 2 && "Select the scholarship programs you are applying for."}
            {currentStep === 3 && "Upload all required supporting documents."}
            {currentStep === 4 && "Choose a convenient schedule for your interview or assessment."}
            {currentStep === 5 && "Review your information carefully before final submission."}
          </p>
        </div>

        {/* Step Content */}
        <div className="flex-1">
          {currentStep === 0 && <PersonalDetailsStep />}
          {currentStep === 1 && (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 animate-in fade-in">
              <p>Academic Profile Details</p>
              <p className="text-sm mt-2">Form fields to be added based on requirements.</p>
            </div>
          )}
          {currentStep === 2 && (
             <div className="flex flex-col items-center justify-center h-64 text-slate-400 animate-in fade-in">
               <p>Scholarship Program Information</p>
               <p className="text-sm mt-2">Form fields to be added based on requirements.</p>
             </div>
          )}
          {currentStep === 3 && <DocumentUploadStep />}
          {currentStep === 4 && (
             <div className="flex flex-col items-center justify-center h-64 text-slate-400 animate-in fade-in">
               <p>Find Schedule</p>
               <p className="text-sm mt-2">Select a date and time for your interview process.</p>
             </div>
          )}
          {currentStep === 5 && (
             <div className="flex flex-col items-center justify-center h-64 text-slate-400 animate-in fade-in">
               <p>Application Review & Final Submission</p>
               <p className="text-sm mt-2">Summary of all provided data.</p>
             </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-6 mt-12">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg border border-slate-300 text-slate-600 font-medium hover:bg-slate-50 disabled:opacity-0 disabled:pointer-events-none transition-all text-[15px]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <button type="button" className="text-[#1E847C] font-medium text-[15px] hover:underline hover:text-[#156a63] transition-colors">
            Save as Draft
          </button>

          <button
            onClick={() => {
              if (currentStep === STEPS.length - 1) {
                setIsSubmitted(true);
              } else {
                setCurrentStep(Math.min(STEPS.length - 1, currentStep + 1));
              }
            }}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#1E847C] text-white font-medium hover:bg-[#156a63] transition-colors shadow-none text-[15px]"
          >
            {currentStep === STEPS.length - 1 ? 'Submit' : 'Next Step'}
            {currentStep !== STEPS.length - 1 && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

const InputField = ({ label, placeholder, defaultValue }: any) => (
  <div className="space-y-2">
    <label className="text-[13px] text-slate-500 font-medium">{label}</label>
    <input
      type="text"
      placeholder={placeholder}
      defaultValue={defaultValue}
      className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-[#1E847C] focus:ring-2 focus:ring-[#1E847C]/20 rounded-lg px-4 py-3 text-[15px] text-slate-800 transition-all outline-none placeholder:text-slate-400"
    />
  </div>
);

const PersonalDetailsStep = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 slide-in-from-bottom-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
        {/* Left Column */}
        <div className="space-y-10">
          <div>
            <h4 className="font-bold text-slate-800 mb-6">Full Name (English)</h4>
            <div className="space-y-5">
              <InputField label="Surname" defaultValue="Dela Cruz" />
              <InputField label="Name" defaultValue="Juan" />
              <InputField label="Middle Name (Optional)" placeholder="e.g. Santos" />
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-800 mb-6">Gender</h4>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" name="gender" defaultChecked className="w-5 h-5 text-[#1E847C] border-2 border-slate-300 focus:ring-[#1E847C] checked:border-[#1E847C]" />
                <span className="text-[15px] text-slate-700 group-hover:text-slate-900 transition-colors">Male</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" name="gender" className="w-5 h-5 text-[#1E847C] border-2 border-slate-300 focus:ring-[#1E847C] checked:border-[#1E847C]" />
                <span className="text-[15px] text-slate-700 group-hover:text-slate-900 transition-colors">Female</span>
              </label>
            </div>
          </div>

          <div>
             <h4 className="font-bold text-slate-800 mb-6">Date of Birth</h4>
             <div className="flex gap-4">
                <div className="w-[100px]"><InputField label="Day" defaultValue="01" /></div>
                <div className="w-[100px]"><InputField label="Month" defaultValue="07" /></div>
                <div className="flex-1"><InputField label="Year" defaultValue="1992" /></div>
             </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-800 mb-6">Place of Birth (English)</h4>
            <div className="space-y-5">
              <InputField label="Village, Town, City" defaultValue="Quezon City" />
              <InputField label="District" defaultValue="Diliman" />
              <InputField label="Region" defaultValue="NCR" />
              <div className="space-y-2">
                <label className="text-[13px] text-slate-500 font-medium">Country</label>
                <div className="relative">
                  <select className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-[#1E847C] focus:ring-2 focus:ring-[#1E847C]/20 rounded-lg pl-4 pr-10 py-3 text-[15px] text-slate-800 transition-all outline-none appearance-none cursor-pointer">
                    <option>Philippines</option>
                    <option>United States</option>
                    <option>Other</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-10">
          <div>
            <h4 className="font-bold text-slate-800 mb-6">Nombre Completo (Español)</h4>
            <div className="space-y-5">
              <InputField label="El Apellido" defaultValue="Dela Cruz" />
              <InputField label="Nombre" defaultValue="Juan" />
              <InputField label="Segundo Nombre (Opcional)" placeholder="" />
            </div>
          </div>

          <div className="pt-[140px] md:pt-[248px]">
            <h4 className="font-bold text-slate-800 mb-6">Lugar de Nacimiento (Español)</h4>
            <div className="space-y-5">
              <InputField label="Pueblo, Ciudad" defaultValue="Ciudad Quezón" />
              <InputField label="Distrito" defaultValue="Diliman" />
              <InputField label="Región" defaultValue="NCR" />
              <div className="space-y-2">
                <label className="text-[13px] text-slate-500 font-medium">País</label>
                <div className="relative">
                  <select className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-[#1E847C] focus:ring-2 focus:ring-[#1E847C]/20 rounded-lg pl-4 pr-10 py-3 text-[15px] text-slate-800 transition-all outline-none appearance-none cursor-pointer">
                    <option>Filipinas</option>
                    <option>Estados Unidos</option>
                    <option>Otro</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DocumentUploadStep = () => {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'completed'>('idle');
  const [progress, setProgress] = useState(0);

  const simulateUpload = () => {
    if (uploadStatus !== 'idle') return;
    setUploadStatus('uploading');
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadStatus('completed');
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 slide-in-from-bottom-4">
      <div className="space-y-4">
        <h4 className="font-bold text-slate-800 flex items-center gap-2">
          Upload Recommendation Letter
          <Info className="w-4 h-4 text-[#1E847C]" />
        </h4>
        <ul className="text-[13px] text-[#64748B] list-inside list-disc space-y-2">
          <li>In color</li>
          <li>A .pdf or .docx file</li>
          <li>Signed by your department head</li>
          <li>At least 50KB and no more than 10MB</li>
        </ul>
      </div>

      <div className="flex flex-wrap gap-6 mt-8">
        {/* Upload Zone */}
        {uploadStatus === 'idle' && (
          <div
            onClick={simulateUpload}
            className="w-[320px] h-[220px] border border-dashed border-[#b8c4ce] rounded-xl bg-white flex flex-col items-center justify-center p-6 text-center hover:border-[#1E847C] transition-colors cursor-pointer group"
          >
            <UploadCloud className="w-10 h-10 text-[#738496] group-hover:text-[#1E847C] mb-4 transition-colors" strokeWidth={1.5} />
            <p className="text-[13px] text-slate-600 mb-1">Drag here</p>
            <p className="text-[13px] text-slate-600">
              or upload file by <span className="text-[#1E847C] font-medium hover:underline">clicking here</span>
            </p>
          </div>
        )}

        {/* Uploading State */}
        {uploadStatus === 'uploading' && (
          <div className="w-[320px] h-[220px] border border-slate-200 rounded-xl bg-white flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-300">
             <div className="relative w-16 h-16 flex items-center justify-center mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
                <div
                  className="absolute inset-0 rounded-full border-4 border-[#1E847C] border-t-transparent animate-spin"
                />
             </div>
             <p className="text-sm font-medium text-slate-700 mb-2">Uploading file...</p>
             <div className="w-full max-w-[200px] bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#1E847C] h-full transition-all duration-200 ease-out rounded-full"
                  style={{ width: `${progress}%` }}
                />
             </div>
             <p className="text-xs text-slate-400 mt-2">{progress}% completed</p>
          </div>
        )}

        {/* Completed State */}
        {uploadStatus === 'completed' && (
          <div className="w-[320px] h-[220px] border border-[#1E847C]/30 rounded-xl bg-white flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-300 relative group">
             <div className="absolute top-4 right-4 text-green-500">
               <CheckCircle2 className="w-6 h-6" />
             </div>
             <div className="w-16 h-16 bg-[#1E847C]/5 rounded-2xl flex items-center justify-center mb-4 text-[#1E847C]">
               <FileText className="w-8 h-8" />
             </div>
             <p className="text-[14px] font-bold text-slate-800 mb-1 truncate w-full px-2">recommendation_letter.pdf</p>
             <p className="text-[12px] text-slate-500 mb-4">1.2 MB</p>
             <button
               onClick={(e) => { e.stopPropagation(); setUploadStatus('idle'); }}
               className="text-[12px] text-[#1E847C] font-medium hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
             >
               Remove file
             </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-[13px] text-[#64748B] mt-12 pt-8">
        <Info className="w-4 h-4 text-[#94A3B8]" />
        Your document will go through a basic technical check upon upload.
      </div>
    </div>
  );
};
