import { useState } from 'react';
import { Plus } from 'lucide-react';

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={onChange}
    className={`${checked ? 'bg-black' : 'bg-slate-200'} relative inline-flex h-[24px] w-[44px] items-center rounded-full transition-colors focus:outline-none flex-shrink-0`}
  >
    <span className={`${checked ? 'translate-x-[22px]' : 'translate-x-[2px]'} inline-block h-[20px] w-[20px] transform rounded-full bg-white transition-transform shadow-sm`} />
  </button>
);

export const AccountSettings = () => {
  const [twoStep, setTwoStep] = useState(true);
  const [supportAccess, setSupportAccess] = useState(true);

  return (
    <div className="flex-1 w-full bg-white p-8 md:p-12 animate-in fade-in duration-500 rounded-lg shadow-sm border border-slate-200">
      <div className="max-w-[800px]">
        {/* My Profile */}
        <h2 className="text-[20px] font-bold text-slate-800 mb-4">My Profile</h2>
        <div className="h-px bg-slate-100 w-full mb-8"></div>

        <div className="flex items-center gap-6 mb-10">
          <img
            src="https://images.unsplash.com/photo-1762445422858-49a118151881?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWlsaW5nJTIwbWlkZGxlJTIwYWdlZCUyMG1hbiUyMHBvcnRyYWl0JTIwZ3JheSUyMGhhaXJ8ZW58MXx8fHwxNzc0NzUyMzcxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Profile"
            className="w-[72px] h-[72px] rounded-full object-cover border border-slate-100"
          />
          <div className="flex flex-col">
            <div className="flex gap-3 mb-2">
              <button className="bg-[#111827] text-white px-4 py-2 rounded-md flex items-center gap-1.5 text-[13px] font-semibold hover:bg-black transition-colors shadow-sm">
                <Plus className="w-4 h-4" /> Change Image
              </button>
              <button className="bg-[#f1f5f9] text-slate-800 px-4 py-2 rounded-md text-[13px] font-semibold hover:bg-slate-200 transition-colors">
                Remove Image
              </button>
            </div>
            <p className="text-[13px] text-slate-400">We support PNGs, JPEGs and GIFs under 2MB</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-14">
          <div className="space-y-2">
            <label className="text-[14px] text-slate-800 font-bold">First Name</label>
            <input
              type="text"
              defaultValue="Brian"
              className="w-full border border-slate-300 rounded-md px-3 py-2.5 text-[14px] text-slate-800 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[14px] text-slate-800 font-bold">Last Name</label>
            <input
              type="text"
              defaultValue="Frederin"
              className="w-full border border-slate-300 rounded-md px-3 py-2.5 text-[14px] text-slate-800 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all"
            />
          </div>
        </div>

        {/* Account Security */}
        <h2 className="text-[20px] font-bold text-slate-800 mb-4">Account Security</h2>
        <div className="h-px bg-slate-100 w-full mb-8"></div>

        <div className="flex flex-col gap-6 mb-12">
          {/* Email */}
          <div className="flex items-end justify-between gap-4">
            <div className="space-y-2 flex-1 max-w-[400px]">
              <label className="text-[14px] text-slate-800 font-bold">Email</label>
              <input
                type="text"
                defaultValue="brianfrederin@email.com"
                disabled
                className="w-full bg-[#f8fafc] border border-slate-100 rounded-md px-3 py-2.5 text-[14px] text-slate-400 outline-none cursor-not-allowed"
              />
            </div>
            <button className="bg-[#f1f5f9] text-slate-800 px-4 py-2.5 rounded-md text-[13px] font-semibold hover:bg-slate-200 transition-colors h-[42px] whitespace-nowrap">
              Change email
            </button>
          </div>

          {/* Password */}
          <div className="flex items-end justify-between gap-4">
            <div className="space-y-2 flex-1 max-w-[400px]">
              <label className="text-[14px] text-slate-800 font-bold">Password</label>
              <input
                type="password"
                defaultValue="**********"
                disabled
                className="w-full bg-[#f8fafc] border border-slate-100 rounded-md px-3 py-2.5 text-[14px] text-slate-400 outline-none cursor-not-allowed tracking-[0.2em]"
              />
            </div>
            <button className="bg-[#f1f5f9] text-slate-800 px-4 py-2.5 rounded-md text-[13px] font-semibold hover:bg-slate-200 transition-colors h-[42px] whitespace-nowrap">
              Change password
            </button>
          </div>
        </div>

        {/* 2-Step Verification */}
        <div className="flex items-center justify-between py-2 mb-10">
          <div className="pr-4">
            <h3 className="text-[15px] font-bold text-slate-800 mb-1">2-Step Verifications</h3>
            <p className="text-[13px] text-slate-500">Add an additional layer of security to your account during login.</p>
          </div>
          <Toggle checked={twoStep} onChange={() => setTwoStep(!twoStep)} />
        </div>

        {/* Support Access */}
        <h2 className="text-[20px] font-bold text-slate-800 mb-4">Support Access</h2>
        <div className="h-px bg-slate-100 w-full mb-8"></div>

        <div className="flex items-center justify-between py-2 mb-6">
          <div className="pr-4">
            <h3 className="text-[15px] font-bold text-slate-800 mb-1">Support access</h3>
            <p className="text-[13px] text-slate-500">You have granted us to access to your account for support purposes until Aug 31, 2023, 9:40 PM.</p>
          </div>
          <Toggle checked={supportAccess} onChange={() => setSupportAccess(!supportAccess)} />
        </div>

        <div className="flex items-center justify-between py-2 mb-6 mt-4">
          <div className="pr-4">
            <h3 className="text-[15px] font-bold text-slate-800 mb-1">Log out of all devices</h3>
            <p className="text-[13px] text-slate-500">Log out of all other active sessions on other devices besides this one.</p>
          </div>
          <button className="bg-[#f1f5f9] text-slate-800 px-4 py-2.5 rounded-md text-[13px] font-semibold hover:bg-slate-200 transition-colors whitespace-nowrap">
            Log out
          </button>
        </div>

        <div className="flex items-center justify-between py-2 mt-4">
          <div className="pr-4">
            <h3 className="text-[15px] font-bold text-[#D85050] mb-1">Delete my account</h3>
            <p className="text-[13px] text-slate-500">Permanently delete the account and remove access from all workspaces.</p>
          </div>
          <button className="bg-[#f1f5f9] text-slate-800 px-4 py-2.5 rounded-md text-[13px] font-semibold hover:bg-slate-200 transition-colors whitespace-nowrap">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};
