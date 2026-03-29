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
    <div className="faculty-panel flex h-[calc(100vh-4rem)] w-full overflow-hidden rounded-[1.5rem]">
      {/* Left Sidebar */}
      <div className="flex w-80 flex-shrink-0 flex-col border-r border-border/70 bg-card">
        {/* Header */}
        <div className="p-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Chats</h2>
          <button className="text-muted-foreground transition-colors hover:text-foreground">
            <MoreVertical size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Search"
              className="w-full rounded-full border border-transparent bg-accent/65 py-2 pl-10 pr-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary/30 focus:bg-card focus:ring-2 focus:ring-primary/15"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {/* Active Chat */}
          <div className="flex cursor-pointer items-center gap-3 bg-accent/60 p-4">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden">
                <img src="https://ui-avatars.com/api/?name=Andrew+Joseph&background=bfdbfe&color=2563eb" alt="Andrew" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-0.5">
                <h3 className="truncate text-sm font-semibold text-foreground">Andrew Joseph</h3>
                <span className="text-xs text-muted-foreground">Yesterday</span>
              </div>
              <div className="flex items-center gap-1 truncate text-sm text-muted-foreground">
                <Check className="w-3.5 h-3.5" />
                <span className="truncate">test</span>
              </div>
            </div>
          </div>

          {/* Other Chats */}
          <div className="flex cursor-pointer items-center gap-3 p-4 transition-colors hover:bg-accent/35">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold overflow-hidden">
                <img src="https://ui-avatars.com/api/?name=Bound+by+Books&background=ffedd5&color=ea580c" alt="Bound" />
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-yellow-400 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-0.5">
                <h3 className="truncate text-sm font-medium text-foreground">Bound by Books</h3>
                <span className="text-xs text-muted-foreground">27/03/2026</span>
              </div>
              <div className="flex items-center gap-1 truncate text-sm text-muted-foreground">
                <CheckCheck className="w-3.5 h-3.5 text-green-500" />
                <span className="truncate">You: Me too.😍</span>
              </div>
            </div>
          </div>

          <div className="flex cursor-pointer items-center gap-3 p-4 transition-colors hover:bg-accent/35">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold overflow-hidden">
                <img src="https://ui-avatars.com/api/?name=Beach+Vibes&background=ccfbf1&color=0d9488" alt="Beach" />
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-yellow-400 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-0.5">
                <h3 className="truncate text-sm font-medium text-foreground">Beach Vibes Only</h3>
                <span className="text-xs text-muted-foreground">27/03/2026</span>
              </div>
              <div className="flex items-center gap-1 truncate text-sm text-muted-foreground">
                <CheckCheck className="w-3.5 h-3.5 text-green-500" />
                <span className="truncate">You: Count me in!</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Nav */}
        <div className="flex items-center justify-around border-t border-border/70 bg-card p-3">
          <button className="flex flex-col items-center gap-1 text-primary">
            <MessageSquare size={20} className="fill-current" />
            <span className="text-[10px] font-medium">Chats</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-muted-foreground transition-colors hover:text-foreground">
            <Phone size={20} />
            <span className="text-[10px] font-medium">Calls</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-muted-foreground transition-colors hover:text-foreground">
            <Users size={20} />
            <span className="text-[10px] font-medium">Users</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-muted-foreground transition-colors hover:text-foreground">
            <UsersRound size={20} />
            <span className="text-[10px] font-medium">Groups</span>
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col bg-accent/25">
        {/* Chat Header */}
        <div className="flex h-[72px] flex-shrink-0 items-center justify-between border-b border-border/70 bg-card px-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden">
               <img src="https://ui-avatars.com/api/?name=Andrew+Joseph&background=bfdbfe&color=2563eb" alt="Andrew" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Andrew Joseph</h2>
              <p className="text-xs text-muted-foreground">Last seen 09 Mar at 01:27 PM</p>
            </div>
          </div>
          <div className="flex items-center gap-5 text-muted-foreground">
            <button className="transition-colors hover:text-foreground"><Phone size={20} /></button>
            <button className="transition-colors hover:text-foreground"><Video size={22} /></button>
            <button className="transition-colors hover:text-foreground"><Search size={20} /></button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">

          <div className="flex justify-center my-2">
            <span className="rounded-full border border-border/70 bg-card px-3 py-1 text-xs text-muted-foreground shadow-sm">
              27 Mar, 2026
            </span>
          </div>

          {/* Sent Message */}
          <div className="flex flex-col items-end gap-1">
            <div className="max-w-[70%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-primary-foreground shadow-sm">
              <p className="text-[15px] leading-relaxed">Definitely. I'll scout some new spots. Btw, how's work been?</p>
            </div>
            <div className="mr-1 flex items-center gap-1 text-[11px] text-muted-foreground">
              <span>03:47 AM</span>
              <CheckCheck className="h-3.5 w-3.5 text-primary" />
            </div>
          </div>

          {/* Received Message */}
          <div className="flex flex-col items-start gap-1">
            <div className="max-w-[70%] rounded-2xl rounded-tl-sm bg-accent/70 px-4 py-2.5 text-foreground shadow-sm">
              <p className="text-[15px] leading-relaxed">Busy but good! They just launched this new project...</p>
            </div>
            <div className="ml-1 text-[11px] text-muted-foreground">03:47 AM</div>
          </div>

          {/* Received Audio Message */}
          <div className="flex flex-col items-start gap-1">
            <div className="flex max-w-[70%] items-center gap-3 rounded-2xl rounded-tl-sm bg-accent/70 p-3 pr-4 text-foreground shadow-sm">
              <button className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-card text-primary shadow-sm">
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
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>0:00 / 0:10</span>
                  <span>03:47 AM</span>
                </div>
              </div>
            </div>
            {/* Reactions */}
            <div className="flex items-center gap-1 mt-1 ml-1">
              <div className="flex items-center gap-1 rounded-full border border-background bg-primary/10 px-2 py-0.5 text-xs shadow-sm">
                <span>🤩</span> <span className="text-[10px] font-medium text-primary">1</span>
              </div>
              <div className="flex items-center gap-1 rounded-full border border-background bg-primary/10 px-2 py-0.5 text-xs shadow-sm">
                <span>🚀</span> <span className="text-[10px] font-medium text-primary">1</span>
              </div>
            </div>
          </div>

          {/* Sent Message */}
          <div className="flex flex-col items-end gap-1 mt-2">
            <div className="max-w-[70%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-primary-foreground shadow-sm">
              <p className="text-[15px] leading-relaxed">No way! That sounds amazing!</p>
            </div>
            <div className="mr-1 flex items-center gap-1 text-[11px] text-muted-foreground">
              <span>03:47 AM</span>
              <CheckCheck className="h-3.5 w-3.5 text-primary" />
            </div>
          </div>

          {/* Received Message */}
          <div className="flex flex-col items-start gap-1">
            <div className="max-w-[70%] rounded-2xl rounded-tl-sm bg-accent/70 px-4 py-2.5 text-foreground shadow-sm">
              <p className="text-[15px] leading-relaxed">Yeah man! Anyway, Saturday it is. I'll bring some snacks and popcorn! 🍿</p>
            </div>
            <div className="ml-1 text-[11px] text-muted-foreground">03:47 AM</div>
          </div>

          {/* Sent Message with reaction */}
          <div className="flex flex-col items-end gap-1 mt-2 relative">
            <div className="relative max-w-[70%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-primary-foreground shadow-sm">
              <p className="text-[15px] leading-relaxed">Awesome! See you then!</p>
            </div>
            {/* Reaction to sent message */}
            <div className="absolute -bottom-3 right-4 z-10 flex items-center gap-1 rounded-full border border-border/60 bg-card px-1.5 py-0.5 text-xs shadow-sm">
               <span>👍🏻</span> <span className="text-[10px] font-medium text-muted-foreground">1</span>
            </div>
            <div className="mr-1 mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
              <span>03:47 AM</span>
              <CheckCheck className="h-3.5 w-3.5 text-primary" />
            </div>
          </div>

          <div className="flex justify-center my-4">
            <span className="rounded-full border border-border/70 bg-card px-3 py-1 text-xs text-muted-foreground shadow-sm">
              Yesterday
            </span>
          </div>

          {/* Sent Message */}
          <div className="flex flex-col items-end gap-1">
            <div className="max-w-[70%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-primary-foreground shadow-sm">
              <p className="text-[15px] leading-relaxed">test</p>
            </div>
            <div className="mr-1 flex items-center gap-1 text-[11px] text-muted-foreground">
              <span>10:55 PM</span>
              <Check className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
          </div>

        </div>

        {/* Chat Input */}
        <div className="bg-accent/25 p-4">
          <div className="faculty-panel flex flex-col rounded-xl p-2">
            <input
              type="text"
              placeholder="Enter your message here"
              className="mb-2 w-full bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground">
                  <Plus size={20} />
                </button>
                <button className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground">
                  <Mic size={20} />
                </button>
                <button className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground">
                  <Smile size={20} />
                </button>
              </div>
              <button className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/70 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                <Send size={18} className="ml-1" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
