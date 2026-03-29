import {
  MoreVertical,
  Search,
  Check,
  CheckCheck,
  MessageSquare,
  Phone,
  Users,
  UsersRound,
  Video,
  Play,
  Download,
  Plus,
  Mic,
  Smile,
  Send,
} from 'lucide-react';

export function ChatView() {
  return (
    <div className="flex w-full h-[calc(100vh-4rem)] bg-white overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-80 flex flex-col border-r border-slate-200 flex-shrink-0 bg-white">
        {/* Header */}
        <div className="p-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Chats</h2>
          <button className="text-slate-500 hover:text-slate-700">
            <MoreVertical size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search"
              className="w-full rounded-full bg-slate-100 py-2 pl-10 pr-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {/* Active Chat */}
          <div className="flex items-center gap-3 p-4 bg-slate-100 cursor-pointer">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden">
                <img src="https://ui-avatars.com/api/?name=Andrew+Joseph&background=bfdbfe&color=2563eb" alt="Andrew" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-0.5">
                <h3 className="text-sm font-semibold text-slate-900 truncate">Andrew Joseph</h3>
                <span className="text-xs text-slate-500">Yesterday</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-slate-500 truncate">
                <Check className="w-3.5 h-3.5" />
                <span className="truncate">test</span>
              </div>
            </div>
          </div>

          {/* Other Chats */}
          <div className="flex items-center gap-3 p-4 hover:bg-slate-50 cursor-pointer transition-colors">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold overflow-hidden">
                <img src="https://ui-avatars.com/api/?name=Bound+by+Books&background=ffedd5&color=ea580c" alt="Bound" />
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-yellow-400 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-0.5">
                <h3 className="text-sm font-medium text-slate-900 truncate">Bound by Books</h3>
                <span className="text-xs text-slate-500">27/03/2026</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-slate-500 truncate">
                <CheckCheck className="w-3.5 h-3.5 text-green-500" />
                <span className="truncate">You: Me too.😍</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 hover:bg-slate-50 cursor-pointer transition-colors">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold overflow-hidden">
                <img src="https://ui-avatars.com/api/?name=Beach+Vibes&background=ccfbf1&color=0d9488" alt="Beach" />
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-yellow-400 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-0.5">
                <h3 className="text-sm font-medium text-slate-900 truncate">Beach Vibes Only</h3>
                <span className="text-xs text-slate-500">27/03/2026</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-slate-500 truncate">
                <CheckCheck className="w-3.5 h-3.5 text-green-500" />
                <span className="truncate">You: Count me in!</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Nav */}
        <div className="flex items-center justify-around p-3 border-t border-slate-200 bg-white">
          <button className="flex flex-col items-center gap-1 text-primary">
            <MessageSquare size={20} className="fill-current" />
            <span className="text-[10px] font-medium">Chats</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600">
            <Phone size={20} />
            <span className="text-[10px] font-medium">Calls</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600">
            <Users size={20} />
            <span className="text-[10px] font-medium">Users</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600">
            <UsersRound size={20} />
            <span className="text-[10px] font-medium">Groups</span>
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#F8F9FA]">
        {/* Chat Header */}
        <div className="h-[72px] flex items-center justify-between px-6 bg-white border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden">
               <img src="https://ui-avatars.com/api/?name=Andrew+Joseph&background=bfdbfe&color=2563eb" alt="Andrew" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Andrew Joseph</h2>
              <p className="text-xs text-slate-500">Last seen 09 Mar at 01:27 PM</p>
            </div>
          </div>
          <div className="flex items-center gap-5 text-slate-600">
            <button className="hover:text-slate-900 transition-colors"><Phone size={20} /></button>
            <button className="hover:text-slate-900 transition-colors"><Video size={22} /></button>
            <button className="hover:text-slate-900 transition-colors"><Search size={20} /></button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">

          <div className="flex justify-center my-2">
            <span className="bg-white border border-slate-200 text-slate-500 text-xs px-3 py-1 rounded-full shadow-sm">
              27 Mar, 2026
            </span>
          </div>

          {/* Sent Message */}
          <div className="flex flex-col items-end gap-1">
            <div className="max-w-[70%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-white shadow-sm">
              <p className="text-[15px] leading-relaxed">Definitely. I'll scout some new spots. Btw, how's work been?</p>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 mr-1">
              <span>03:47 AM</span>
              <CheckCheck className="h-3.5 w-3.5 text-primary" />
            </div>
          </div>

          {/* Received Message */}
          <div className="flex flex-col items-start gap-1">
            <div className="bg-[#F1F3F5] text-slate-800 px-4 py-2.5 rounded-2xl rounded-tl-sm max-w-[70%] shadow-sm">
              <p className="text-[15px] leading-relaxed">Busy but good! They just launched this new project...</p>
            </div>
            <div className="text-[11px] text-slate-400 ml-1">03:47 AM</div>
          </div>

          {/* Received Audio Message */}
          <div className="flex flex-col items-start gap-1">
            <div className="bg-[#F1F3F5] text-slate-800 p-3 pr-4 rounded-2xl rounded-tl-sm max-w-[70%] shadow-sm flex items-center gap-3">
                <button className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white text-primary shadow-sm">
                <Play size={18} className="ml-0.5 fill-current" />
              </button>
              <div className="flex flex-col flex-1 min-w-[200px]">
                <div className="flex items-center gap-2 mb-1">
                  {/* Fake Waveform */}
                  <div className="flex items-center gap-[2px] h-6 flex-1 opacity-70">
                    {[2, 4, 3, 5, 2, 6, 8, 4, 3, 5, 2, 4, 6, 4, 2, 3, 5, 2, 4, 3, 2, 5, 4, 2].map((h, i) => (
                      <div key={i} className="w-[3px] rounded-full bg-primary" style={{ height: `${h * 10}%` }}></div>
                    ))}
                  </div>
                  <button className="text-primary">
                    <Download size={18} />
                  </button>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>0:00 / 0:10</span>
                  <span>03:47 AM</span>
                </div>
              </div>
            </div>
            {/* Reactions */}
            <div className="flex items-center gap-1 mt-1 ml-1">
              <div className="flex items-center gap-1 rounded-full border border-white bg-primary/10 px-2 py-0.5 text-xs shadow-sm">
                <span>🤩</span> <span className="text-[10px] font-medium text-primary">1</span>
              </div>
              <div className="flex items-center gap-1 rounded-full border border-white bg-primary/10 px-2 py-0.5 text-xs shadow-sm">
                <span>🚀</span> <span className="text-[10px] font-medium text-primary">1</span>
              </div>
            </div>
          </div>

          {/* Sent Message */}
          <div className="flex flex-col items-end gap-1 mt-2">
            <div className="max-w-[70%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-white shadow-sm">
              <p className="text-[15px] leading-relaxed">No way! That sounds amazing!</p>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 mr-1">
              <span>03:47 AM</span>
              <CheckCheck className="h-3.5 w-3.5 text-primary" />
            </div>
          </div>

          {/* Received Message */}
          <div className="flex flex-col items-start gap-1">
            <div className="bg-[#F1F3F5] text-slate-800 px-4 py-2.5 rounded-2xl rounded-tl-sm max-w-[70%] shadow-sm">
              <p className="text-[15px] leading-relaxed">Yeah man! Anyway, Saturday it is. I'll bring some snacks and popcorn! 🍿</p>
            </div>
            <div className="text-[11px] text-slate-400 ml-1">03:47 AM</div>
          </div>

          {/* Sent Message with reaction */}
          <div className="flex flex-col items-end gap-1 mt-2 relative">
            <div className="relative max-w-[70%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-white shadow-sm">
              <p className="text-[15px] leading-relaxed">Awesome! See you then!</p>
            </div>
            {/* Reaction to sent message */}
            <div className="absolute -bottom-3 right-4 bg-white border border-slate-100 rounded-full px-1.5 py-0.5 text-xs flex items-center gap-1 shadow-sm z-10">
               <span>👍🏻</span> <span className="text-slate-600 font-medium text-[10px]">1</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 mr-1 mt-1">
              <span>03:47 AM</span>
              <CheckCheck className="h-3.5 w-3.5 text-primary" />
            </div>
          </div>

          <div className="flex justify-center my-4">
            <span className="bg-white border border-slate-200 text-slate-500 text-xs px-3 py-1 rounded-full shadow-sm">
              Yesterday
            </span>
          </div>

          {/* Sent Message */}
          <div className="flex flex-col items-end gap-1">
            <div className="max-w-[70%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-white shadow-sm">
              <p className="text-[15px] leading-relaxed">test</p>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 mr-1">
              <span>10:55 PM</span>
              <Check className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

        </div>

        {/* Chat Input */}
        <div className="p-4 bg-[#F8F9FA]">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col p-2">
            <input
              type="text"
              placeholder="Enter your message here"
              className="w-full px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none mb-2"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors">
                  <Plus size={20} />
                </button>
                <button className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors">
                  <Mic size={20} />
                </button>
                <button className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors">
                  <Smile size={20} />
                </button>
              </div>
              <button className="w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full flex items-center justify-center transition-colors">
                <Send size={18} className="ml-1" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
