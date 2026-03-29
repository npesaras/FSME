import { useState, type ReactNode } from 'react'
import {
  LayoutDashboard,
  Globe,
  ChevronDown,
  Menu,
  UserCircle,
  LogOut,
  AppWindow,
  MessageSquare,
  Bell,
  Settings,
} from 'lucide-react'

import { AccountSettings } from '../../../components/Faculty/AccountSettings'
import { Calendar } from '../../../components/Faculty/Calendar'
import { ChatView } from '../../../components/Faculty/ChatView'
import { LoginMonitoringTable } from '../../../components/Faculty/LoginMonitoringTable'
import { RecentActivities } from '../../../components/Faculty/RecentActivities'
import { ScholarshipApplication } from '../../../components/Faculty/ScholarshipApplication'

interface NavItemProps {
  icon: ReactNode
  label: string
  active?: boolean
  subItems?: { label: string; icon: ReactNode; id?: string }[]
  onNavigate?: (view: string) => void
}

const SidebarItem = ({ icon, label, active, subItems, onNavigate }: NavItemProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const hasSubmenu = Boolean(subItems?.length)

  const toggleMenu = () => {
    if (hasSubmenu) {
      setIsOpen(!isOpen)
    } else if (onNavigate) {
      onNavigate(label.toLowerCase().replace(' ', '-'))
    }
  }

  return (
    <div className="mb-1">
      <div
        onClick={toggleMenu}
        className={`flex cursor-pointer items-center justify-between px-4 py-3 transition-colors ${
          active
            ? 'border-r-4 border-primary bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-accent/40 hover:text-foreground'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={active ? 'text-primary' : 'text-muted-foreground'}>
            {icon}
          </div>
          <span className="font-medium text-sm">{label}</span>
        </div>
        {hasSubmenu && (
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpen ? '' : '-rotate-90'}`}
          />
        )}
      </div>

      {hasSubmenu && isOpen && (
        <div className="bg-accent/20 py-2">
          {(subItems ?? []).map((item, index) => (
            <div
              key={index}
              onClick={(e) => {
                e.stopPropagation()
                if (onNavigate && item.id) {
                  onNavigate(item.id)
                }
              }}
              className="flex cursor-pointer items-center gap-3 px-4 py-2 pl-12 text-muted-foreground transition-colors hover:bg-accent/40 hover:text-primary"
            >
              <div className="h-4 w-4 text-muted-foreground">{item.icon}</div>
              <span className="text-sm">{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function FacultyDashboard() {
  const [currentView, setCurrentView] = useState('dashboard')
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-background font-sans text-foreground">
      <aside className="sticky top-0 hidden h-screen w-64 flex-shrink-0 flex-col overflow-y-auto border-r border-border bg-card md:flex">
        <div className="p-6 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Globe className="h-5 w-5" />
          </div>
          <span className="leading-tight text-xl font-bold tracking-tight text-foreground [font-family:var(--font-heading)]">
            Tanaw School System
          </span>
        </div>

        <nav className="flex-1 py-4 space-y-1">
          <SidebarItem
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            active={currentView === 'dashboard'}
            onNavigate={() => setCurrentView('dashboard')}
          />
          <SidebarItem
            icon={<AppWindow size={20} />}
            label="Application"
            active={currentView === 'application'}
            onNavigate={() => setCurrentView('application')}
          />
          <SidebarItem
            icon={<MessageSquare size={20} />}
            label="Chat"
            active={currentView === 'chat'}
            onNavigate={() => setCurrentView('chat')}
          />
          <SidebarItem
            icon={<UserCircle size={20} />}
            label="Account Setting"
            active={currentView === 'account-setting'}
            onNavigate={() => setCurrentView('account-setting')}
          />

          <div className="mx-4 my-4 border-t border-border/70"></div>

          <SidebarItem icon={<LogOut size={20} />} label="Logout" />
        </nav>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur">
          <div className="flex items-center gap-4 flex-1">
            <button className="md:hidden">
              <Menu className="h-6 w-6 text-muted-foreground" />
            </button>
          </div>

          <div className="flex items-center gap-5">
            <button className="relative text-muted-foreground transition-colors hover:text-primary">
              <Bell className="w-[22px] h-[22px]" strokeWidth={1.5} />
              <span className="absolute right-[2px] top-[2px] h-[7px] w-[7px] rounded-full border border-background bg-destructive"></span>
            </button>

            <div className="mx-2 hidden h-8 w-px bg-border md:block"></div>

            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex cursor-pointer items-center gap-3 rounded-lg p-1 transition-colors hover:bg-accent/40"
              >
                <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border border-border shadow-sm">
                  <img
                    src="https://images.unsplash.com/photo-1554765345-6ad6a5417cde?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzQ2NTUyOTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="Thomas Anree"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-left hidden md:block mr-2">
                  <p className="leading-tight text-[14px] font-bold text-foreground">Thomas Anree</p>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">UX/UI Designer</p>
                </div>
                <ChevronDown className={`hidden h-4 w-4 text-muted-foreground transition-transform md:block ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileOpen && (
                <div className="animate-in fade-in slide-in-from-top-2 absolute right-0 z-50 mt-2 w-56 rounded-xl border border-border bg-popover py-2 text-popover-foreground shadow-lg">
                  <button
                    onClick={() => {
                      setCurrentView('account-setting')
                      setIsProfileOpen(false)
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[14px] font-medium text-foreground transition-colors hover:bg-accent/40 hover:text-primary"
                  >
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    Account Setting
                  </button>
                  <div className="my-1 h-px bg-border"></div>
                  <button
                    onClick={() => setIsProfileOpen(false)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[14px] font-medium text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4 text-destructive" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {currentView === 'chat' ? (
          <div className="flex-1 flex">
            <ChatView />
          </div>
        ) : (
          <div className="mx-auto w-full max-w-[1600px] p-6 md:p-8">
            {currentView === 'dashboard' && (
              <>
                <section className="mb-6">
                  <div className="relative flex min-h-[160px] w-full items-center justify-between overflow-hidden rounded-[1.5rem] bg-primary p-6 text-primary-foreground shadow-sm">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,color-mix(in_oklab,var(--secondary)_55%,transparent)_0%,transparent_48%)] opacity-80" />
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0%,rgba(255,255,255,0.08)_100%)]" />
                    <div className="relative z-10 flex h-full max-w-[60%] flex-col justify-center">
                      <p className="mb-3 text-sm font-semibold tracking-[0.18em] text-primary-foreground/70 uppercase">
                        Faculty Workspace
                      </p>
                      <h1 className="mb-2 text-2xl font-bold md:text-3xl [font-family:var(--font-heading)]">
                        Welcome back, Juan!
                      </h1>
                      <p className="text-sm text-primary-foreground/80">Faculty Scholarship</p>
                    </div>
                    <div className="z-10 hidden pr-8 text-right md:block">
                      <div className="text-3xl font-bold text-primary-foreground">Thursday, 7:30 PM</div>
                      <div className="mt-1 text-lg font-semibold text-primary-foreground/70">09 Feb 2024</div>
                    </div>
                  </div>
                </section>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                  <div className="space-y-6 lg:col-span-3">
                    <LoginMonitoringTable />
                  </div>
                  <div className="space-y-6 lg:col-span-1">
                    <Calendar />
                    <RecentActivities />
                  </div>
                </div>
              </>
            )}

            {currentView === 'application' && (
              <div className="space-y-6">
                <div className="flex flex-col gap-1">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground [font-family:var(--font-heading)]">
                    Faculty Scholarship Application
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Complete your application for the upcoming faculty development program.
                  </p>
                </div>
                <ScholarshipApplication />
              </div>
            )}

            {currentView === 'account-setting' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground [font-family:var(--font-heading)]">
                      Account Settings
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Manage your profile, security preferences, and personal data.
                    </p>
                  </div>
                </div>
                <AccountSettings />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
