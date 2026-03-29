import { useState } from 'react';
import { Plus } from 'lucide-react';

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={onChange}
    className={`${checked ? 'bg-foreground' : 'bg-switch-background'} relative inline-flex h-[24px] w-[44px] flex-shrink-0 items-center rounded-full transition-colors focus:outline-none`}
  >
    <span className={`${checked ? 'translate-x-[22px]' : 'translate-x-[2px]'} inline-block h-[20px] w-[20px] transform rounded-full bg-background transition-transform shadow-sm`} />
  </button>
);

export const AccountSettings = () => {
  const [twoStep, setTwoStep] = useState(true);
  const [supportAccess, setSupportAccess] = useState(true);

  return (
    <div className="faculty-panel animate-in fade-in flex-1 w-full rounded-lg p-8 duration-500 md:p-12">
      <div className="max-w-[800px]">
        {/* My Profile */}
        <h2 className="mb-4 text-[20px] font-bold text-foreground">My Profile</h2>
        <div className="mb-8 h-px w-full bg-border/60"></div>

        <div className="flex items-center gap-6 mb-10">
          <img
            src="https://images.unsplash.com/photo-1762445422858-49a118151881?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWlsaW5nJTIwbWlkZGxlJTIwYWdlZCUyMG1hbiUyMHBvcnRyYWl0JTIwZ3JheSUyMGhhaXJ8ZW58MXx8fHwxNzc0NzUyMzcxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Profile"
            className="h-[72px] w-[72px] rounded-full border border-border/50 object-cover"
          />
          <div className="flex flex-col">
            <div className="flex gap-3 mb-2">
              <button className="faculty-button-solid flex items-center gap-1.5 rounded-md px-4 py-2 text-[13px] font-semibold shadow-sm transition-colors">
                <Plus className="w-4 h-4" /> Change Image
              </button>
              <button className="faculty-button-muted rounded-md px-4 py-2 text-[13px] font-semibold transition-colors">
                Remove Image
              </button>
            </div>
            <p className="text-[13px] text-muted-foreground">We support PNGs, JPEGs and GIFs under 2MB</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-14">
          <div className="space-y-2">
            <label className="text-[14px] font-bold text-foreground">First Name</label>
            <input
              type="text"
              defaultValue="Brian"
              className="faculty-input w-full rounded-md px-3 py-2.5 text-[14px]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[14px] font-bold text-foreground">Last Name</label>
            <input
              type="text"
              defaultValue="Frederin"
              className="faculty-input w-full rounded-md px-3 py-2.5 text-[14px]"
            />
          </div>
        </div>

        {/* Account Security */}
        <h2 className="mb-4 text-[20px] font-bold text-foreground">Account Security</h2>
        <div className="mb-8 h-px w-full bg-border/60"></div>

        <div className="flex flex-col gap-6 mb-12">
          {/* Email */}
          <div className="flex items-end justify-between gap-4">
            <div className="space-y-2 flex-1 max-w-[400px]">
              <label className="text-[14px] font-bold text-foreground">Email</label>
              <input
                type="text"
                defaultValue="brianfrederin@email.com"
                disabled
                className="w-full cursor-not-allowed rounded-md border border-border/60 bg-accent/35 px-3 py-2.5 text-[14px] text-muted-foreground outline-none"
              />
            </div>
            <button className="faculty-button-muted h-[42px] whitespace-nowrap rounded-md px-4 py-2.5 text-[13px] font-semibold transition-colors">
              Change email
            </button>
          </div>

          {/* Password */}
          <div className="flex items-end justify-between gap-4">
            <div className="space-y-2 flex-1 max-w-[400px]">
              <label className="text-[14px] font-bold text-foreground">Password</label>
              <input
                type="password"
                defaultValue="**********"
                disabled
                className="w-full cursor-not-allowed rounded-md border border-border/60 bg-accent/35 px-3 py-2.5 text-[14px] tracking-[0.2em] text-muted-foreground outline-none"
              />
            </div>
            <button className="faculty-button-muted h-[42px] whitespace-nowrap rounded-md px-4 py-2.5 text-[13px] font-semibold transition-colors">
              Change password
            </button>
          </div>
        </div>

        {/* 2-Step Verification */}
        <div className="flex items-center justify-between py-2 mb-10">
          <div className="pr-4">
            <h3 className="mb-1 text-[15px] font-bold text-foreground">2-Step Verifications</h3>
            <p className="text-[13px] text-muted-foreground">Add an additional layer of security to your account during login.</p>
          </div>
          <Toggle checked={twoStep} onChange={() => setTwoStep(!twoStep)} />
        </div>

        {/* Support Access */}
        <h2 className="mb-4 text-[20px] font-bold text-foreground">Support Access</h2>
        <div className="mb-8 h-px w-full bg-border/60"></div>

        <div className="flex items-center justify-between py-2 mb-6">
          <div className="pr-4">
            <h3 className="mb-1 text-[15px] font-bold text-foreground">Support access</h3>
            <p className="text-[13px] text-muted-foreground">You have granted us to access to your account for support purposes until Aug 31, 2023, 9:40 PM.</p>
          </div>
          <Toggle checked={supportAccess} onChange={() => setSupportAccess(!supportAccess)} />
        </div>

        <div className="flex items-center justify-between py-2 mb-6 mt-4">
          <div className="pr-4">
            <h3 className="mb-1 text-[15px] font-bold text-foreground">Log out of all devices</h3>
            <p className="text-[13px] text-muted-foreground">Log out of all other active sessions on other devices besides this one.</p>
          </div>
          <button className="faculty-button-muted whitespace-nowrap rounded-md px-4 py-2.5 text-[13px] font-semibold transition-colors">
            Log out
          </button>
        </div>

        <div className="flex items-center justify-between py-2 mt-4">
          <div className="pr-4">
            <h3 className="mb-1 text-[15px] font-bold text-destructive">Delete my account</h3>
            <p className="text-[13px] text-muted-foreground">Permanently delete the account and remove access from all workspaces.</p>
          </div>
          <button className="faculty-button-muted whitespace-nowrap rounded-md px-4 py-2.5 text-[13px] font-semibold transition-colors">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};
