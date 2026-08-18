"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Search, Menu, X, Briefcase, User, LogOut, LayoutDashboard, Building2, Globe } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/notifications/NotificationBell";

export function Header() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      window.location.href = `/jobs?q=${encodeURIComponent(search.trim())}`;
    }
  };

  const isAdminUser = user?.roles.some((r) => ["Super Admin", "Admin", "Manager", "Moderator", "Editor", "Publisher"].includes(r));
  const isEmployer = user?.roles.includes("Employer");

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-sm">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-lg text-slate-900 leading-tight">GlobalHire</div>
              <div className="text-[10px] text-slate-500 leading-tight -mt-0.5">Global Jobs Platform</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            <NavLink href="/jobs">Jobs</NavLink>
            <NavLink href="/companies">Companies</NavLink>
            <NavLink href="/government">Government</NavLink>
            <NavLink href="/remote">Remote</NavLink>
            <NavLink href="/blog">Career Resources</NavLink>
            {!user ? (
              <Link href="/employer/signup" className="px-3 py-2 text-sm font-medium text-emerald-700 hover:text-emerald-800 rounded-md hover:bg-emerald-50">
                Post a Job
              </Link>
            ) : isEmployer ? (
              <NavLink href="/employer">Employer Portal</NavLink>
            ) : (
              <NavLink href="/employers">For Employers</NavLink>
            )}
          </nav>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xs">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                type="text"
                placeholder="Quick search..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-100 border border-transparent rounded-lg focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
              />
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {user && <NotificationBell />}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-xs font-semibold">
                    {user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium text-slate-700 max-w-[120px] truncate">
                    {user.name.split(" ")[0]}
                  </span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-2 animate-fade-in">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <div className="font-medium text-sm text-slate-900">{user.name}</div>
                      <div className="text-xs text-slate-500 truncate">{user.email}</div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {user.roles.slice(0, 2).map((r) => (
                          <span key={r} className="inline-block text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded">
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                    <MenuItem icon={User} href="/dashboard" onClick={() => setUserMenuOpen(false)}>
                      My Dashboard
                    </MenuItem>
                    <MenuItem icon={Briefcase} href="/dashboard/applications" onClick={() => setUserMenuOpen(false)}>
                      My Applications
                    </MenuItem>
                    {isEmployer && (
                      <MenuItem icon={Building2} href="/employer" onClick={() => setUserMenuOpen(false)}>
                        Employer Portal
                      </MenuItem>
                    )}
                    {isAdminUser && (
                      <MenuItem icon={LayoutDashboard} href="/admin" onClick={() => setUserMenuOpen(false)}>
                        Admin Portal
                      </MenuItem>
                    )}
                    <MenuItem icon={Globe} href="/dashboard/profile" onClick={() => setUserMenuOpen(false)}>
                      Settings
                    </MenuItem>
                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="hidden sm:inline-flex text-sm font-medium text-slate-700 hover:text-emerald-700 px-3 py-2">
                  Login
                </Link>
                <Link href="/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-slate-200 py-3 space-y-1 animate-fade-in">
            <form onSubmit={handleSearch} className="pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  type="text"
                  placeholder="Search jobs..."
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-100 rounded-lg focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </form>
            <MobileLink href="/jobs" onClick={() => setMobileOpen(false)}>Jobs</MobileLink>
            <MobileLink href="/companies" onClick={() => setMobileOpen(false)}>Companies</MobileLink>
            <MobileLink href="/government" onClick={() => setMobileOpen(false)}>Government Jobs</MobileLink>
            <MobileLink href="/remote" onClick={() => setMobileOpen(false)}>Remote Jobs</MobileLink>
            <MobileLink href="/blog" onClick={() => setMobileOpen(false)}>Career Resources</MobileLink>
            <MobileLink href="/employers" onClick={() => setMobileOpen(false)}>For Employers</MobileLink>
            {!user && (
              <div className="flex gap-2 pt-3 border-t border-slate-200">
                <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1">
                  <Button variant="outline" className="w-full">Login</Button>
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="flex-1">
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-emerald-700 rounded-md hover:bg-slate-50">
      {children}
    </Link>
  );
}

function MobileLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-md">
      {children}
    </Link>
  );
}

function MenuItem({ icon: Icon, href, children, onClick }: { icon: any; href: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
      <Icon className="w-4 h-4 text-slate-400" />
      {children}
    </Link>
  );
}
