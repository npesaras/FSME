import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Calendar = () => {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  // Hardcoded for January 2024 as per the image reference structure
  // Starting on Monday (based on image where 1st is Friday? No wait.
  // Image: 1 is Friday, 2 Saturday.
  // So S M T W T F S
  //             1 2
  // 3 4 ...

  const dates = [
    null, null, null, null, null, 1, 2,
    3, 4, 5, 6, 7, 8, 9,
    10, 11, 12, 13, 14, 15, 16,
    17, 18, 19, 20, 21, 22, 23,
    24, 25, 26, 27, 28, 29, 30
  ];

  return (
    <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
      {/* Header */}
      <div className="bg-slate-100 rounded-lg p-2 flex items-center justify-between mb-4">
        <button className="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-500">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-bold text-slate-800 text-sm">January 2024</span>
        <button className="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-500">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 mb-2 text-center">
        {days.map((day, index) => (
          <div key={index} className="text-xs font-medium text-slate-500 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Dates Grid */}
      <div className="grid grid-cols-7 text-center gap-y-2">
        {dates.map((date, index) => (
          <div key={index} className="flex items-center justify-center">
            {date ? (
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full text-sm transition-colors ${
                  date === 4
                    ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {date}
              </div>
            ) : (
              <div className="w-8 h-8" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
