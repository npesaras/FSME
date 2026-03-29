import { useState } from 'react';
import { UploadCloud, Info, ArrowLeft, ArrowRight, FileText, CheckCircle2 } from 'lucide-react';

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
      <div className="faculty-panel animate-in zoom-in-95 flex min-h-[600px] flex-1 flex-col items-center justify-center rounded-lg p-8 duration-500 md:p-16">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
        <h2 className="mb-4 text-center text-3xl font-bold text-foreground">Application Submitted!</h2>
        <p className="mb-8 max-w-md text-center text-muted-foreground">
          Thank you for applying. We have received your scholarship application. You will be notified of the results via email within 5-7 business days.
        </p>
        <button
          onClick={() => {
            setIsSubmitted(false);
            setCurrentStep(0);
          }}
          className="rounded-lg bg-primary px-6 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="faculty-panel flex min-h-[600px] w-full flex-col items-stretch overflow-hidden rounded-lg xl:flex-row">
      {/* Sidebar Stepper */}
      <div className="faculty-panel-subtle flex w-full flex-shrink-0 flex-col border-b border-border/70 p-6 md:p-8 xl:w-72 xl:border-b-0 xl:border-r">
        <h3 className="mb-8 text-lg font-bold text-foreground">Application Form</h3>
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
                      isCompleted ? 'bg-primary' : 'bg-border'
                    }`}
                  />
                )}

                {/* Circle */}
                <div className={`relative z-10 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-card transition-colors duration-300 ${
                  isActive || isCompleted ? 'border-2 border-primary' : 'border-2 border-border'
                }`}>
                  {isActive && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                </div>

                {/* Text */}
                <div className={`text-[13px] pt-0.5 transition-colors duration-300 ${
                  isActive ? 'font-bold text-foreground' :
                  isCompleted ? 'font-medium text-muted-foreground' :
                  'font-medium text-muted-foreground/65'
                }`}>
                  {step}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex w-full flex-1 flex-col bg-card p-6 md:p-10">
        {/* Header */}
        <div className="mb-8 border-b border-border/70 pb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-foreground">{STEPS[currentStep]}</h2>
            <span className="rounded-full border border-border/60 bg-accent/45 px-3 py-1 text-[15px] font-medium text-muted-foreground">Step {currentStep + 1} of {STEPS.length}</span>
          </div>
          <p className="text-[14px] text-muted-foreground">
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
            <div className="animate-in fade-in flex h-64 flex-col items-center justify-center text-muted-foreground">
              <p>Academic Profile Details</p>
              <p className="text-sm mt-2">Form fields to be added based on requirements.</p>
            </div>
          )}
          {currentStep === 2 && (
             <div className="animate-in fade-in flex h-64 flex-col items-center justify-center text-muted-foreground">
               <p>Scholarship Program Information</p>
               <p className="text-sm mt-2">Form fields to be added based on requirements.</p>
             </div>
          )}
          {currentStep === 3 && <DocumentUploadStep />}
          {currentStep === 4 && (
             <div className="animate-in fade-in flex h-64 flex-col items-center justify-center text-muted-foreground">
               <p>Find Schedule</p>
               <p className="text-sm mt-2">Select a date and time for your interview process.</p>
             </div>
          )}
          {currentStep === 5 && (
             <div className="animate-in fade-in flex h-64 flex-col items-center justify-center text-muted-foreground">
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
            className="faculty-button-muted flex items-center gap-2 rounded-lg px-6 py-2.5 text-[15px] font-medium transition-all disabled:pointer-events-none disabled:opacity-0"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <button type="button" className="text-[15px] font-medium text-primary transition-colors hover:text-primary/80 hover:underline">
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
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-[15px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
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
    <label className="text-[13px] font-medium text-muted-foreground">{label}</label>
    <input
      type="text"
      placeholder={placeholder}
      defaultValue={defaultValue}
      className="faculty-input w-full rounded-lg px-4 py-3 text-[15px]"
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
            <h4 className="mb-6 font-bold text-foreground">Full Name (English)</h4>
            <div className="space-y-5">
              <InputField label="Surname" defaultValue="Dela Cruz" />
              <InputField label="Name" defaultValue="Juan" />
              <InputField label="Middle Name (Optional)" placeholder="e.g. Santos" />
            </div>
          </div>

          <div>
            <h4 className="mb-6 font-bold text-foreground">Gender</h4>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" name="gender" defaultChecked className="h-5 w-5 border-2 border-border text-primary focus:ring-primary/20 checked:border-primary" />
                <span className="text-[15px] text-muted-foreground transition-colors group-hover:text-foreground">Male</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" name="gender" className="h-5 w-5 border-2 border-border text-primary focus:ring-primary/20 checked:border-primary" />
                <span className="text-[15px] text-muted-foreground transition-colors group-hover:text-foreground">Female</span>
              </label>
            </div>
          </div>

          <div>
             <h4 className="mb-6 font-bold text-foreground">Date of Birth</h4>
             <div className="flex gap-4">
                <div className="w-[100px]"><InputField label="Day" defaultValue="01" /></div>
                <div className="w-[100px]"><InputField label="Month" defaultValue="07" /></div>
                <div className="flex-1"><InputField label="Year" defaultValue="1992" /></div>
             </div>
          </div>

          <div>
            <h4 className="mb-6 font-bold text-foreground">Place of Birth (English)</h4>
            <div className="space-y-5">
              <InputField label="Village, Town, City" defaultValue="Quezon City" />
              <InputField label="District" defaultValue="Diliman" />
              <InputField label="Region" defaultValue="NCR" />
              <div className="space-y-2">
                <label className="text-[13px] font-medium text-muted-foreground">Country</label>
                <div className="relative">
                  <select className="faculty-input w-full appearance-none rounded-lg py-3 pl-4 pr-10 text-[15px] cursor-pointer">
                    <option>Philippines</option>
                    <option>United States</option>
                    <option>Other</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-muted-foreground">
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
            <h4 className="mb-6 font-bold text-foreground">Nombre Completo (Español)</h4>
            <div className="space-y-5">
              <InputField label="El Apellido" defaultValue="Dela Cruz" />
              <InputField label="Nombre" defaultValue="Juan" />
              <InputField label="Segundo Nombre (Opcional)" placeholder="" />
            </div>
          </div>

          <div className="pt-[140px] md:pt-[248px]">
            <h4 className="mb-6 font-bold text-foreground">Lugar de Nacimiento (Español)</h4>
            <div className="space-y-5">
              <InputField label="Pueblo, Ciudad" defaultValue="Ciudad Quezón" />
              <InputField label="Distrito" defaultValue="Diliman" />
              <InputField label="Región" defaultValue="NCR" />
              <div className="space-y-2">
                <label className="text-[13px] font-medium text-muted-foreground">País</label>
                <div className="relative">
                  <select className="faculty-input w-full appearance-none rounded-lg py-3 pl-4 pr-10 text-[15px] cursor-pointer">
                    <option>Filipinas</option>
                    <option>Estados Unidos</option>
                    <option>Otro</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-muted-foreground">
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
        <h4 className="flex items-center gap-2 font-bold text-foreground">
          Upload Recommendation Letter
          <Info className="h-4 w-4 text-primary" />
        </h4>
        <ul className="list-inside list-disc space-y-2 text-[13px] text-muted-foreground">
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
            className="faculty-panel flex h-[220px] w-[320px] cursor-pointer flex-col items-center justify-center rounded-xl border-dashed p-6 text-center transition-colors group hover:border-primary/60"
          >
            <UploadCloud className="mb-4 h-10 w-10 text-muted-foreground transition-colors group-hover:text-primary" strokeWidth={1.5} />
            <p className="mb-1 text-[13px] text-muted-foreground">Drag here</p>
            <p className="text-[13px] text-muted-foreground">
              or upload file by <span className="font-medium text-primary hover:underline">clicking here</span>
            </p>
          </div>
        )}

        {/* Uploading State */}
        {uploadStatus === 'uploading' && (
          <div className="faculty-panel animate-in zoom-in-95 flex h-[220px] w-[320px] flex-col items-center justify-center rounded-xl p-6 text-center duration-300">
             <div className="relative mb-6 flex h-16 w-16 items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-accent/80" />
                <div
                  className="absolute inset-0 animate-spin rounded-full border-4 border-primary border-t-transparent"
                />
             </div>
             <p className="mb-2 text-sm font-medium text-foreground">Uploading file...</p>
             <div className="h-2 w-full max-w-[200px] overflow-hidden rounded-full bg-accent/80">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-200 ease-out"
                  style={{ width: `${progress}%` }}
                />
             </div>
             <p className="mt-2 text-xs text-muted-foreground">{progress}% completed</p>
          </div>
        )}

        {/* Completed State */}
        {uploadStatus === 'completed' && (
          <div className="faculty-panel animate-in zoom-in-95 relative flex h-[220px] w-[320px] flex-col items-center justify-center rounded-xl border-primary/25 p-6 text-center duration-300 group">
             <div className="absolute right-4 top-4 text-green-500">
               <CheckCircle2 className="h-6 w-6" />
             </div>
             <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/6 text-primary">
               <FileText className="h-8 w-8" />
             </div>
             <p className="mb-1 w-full truncate px-2 text-[14px] font-bold text-foreground">recommendation_letter.pdf</p>
             <p className="mb-4 text-[12px] text-muted-foreground">1.2 MB</p>
             <button
               onClick={(e) => { e.stopPropagation(); setUploadStatus('idle'); }}
               className="text-[12px] font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100 hover:underline"
             >
               Remove file
             </button>
          </div>
        )}
      </div>

      <div className="mt-12 flex items-center gap-2 pt-8 text-[13px] text-muted-foreground">
        <Info className="h-4 w-4 text-muted-foreground" />
        Your document will go through a basic technical check upon upload.
      </div>
    </div>
  );
};
