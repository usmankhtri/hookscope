import React, { useState } from 'react';
import { NavLink, Link, Outlet } from 'react-router-dom';
import { ThemeToggle } from '../common/ThemeToggle';
import { ArrowRight, Menu, X } from 'lucide-react';
import { HookLabLogo } from '../brand/HookLabLogo';

export const PublicLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/docs', label: 'Docs' },
    { to: '/security', label: 'Security' },
    { to: '/privacy', label: 'Privacy' },
    { to: '/about', label: 'About' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans selection:bg-neutral-200 dark:selection:bg-neutral-800">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#121214]/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          {/* Brand */}
          <Link to="/" className="focus:outline-hidden">
            <HookLabLogo />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `transition-colors ${
                    isActive
                      ? 'text-neutral-950 dark:text-neutral-50 font-semibold'
                      : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            <Link
              to="/app"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-white transition-colors"
            >
              <span>Open Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-neutral-600 dark:text-neutral-400"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121214] px-4 py-3 space-y-1">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        )}
      </header>

      {/* Main Outlet */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* Minimal Public Footer */}
      <footer className="h-12 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121214] text-xs text-neutral-500 font-sans">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between flex-wrap gap-2 text-2xs">
          <span>HookLab · Inspect, test, replay, and understand webhooks.</span>
          <div className="flex items-center gap-4">
            <Link to="/docs" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
              Docs
            </Link>
            <Link to="/security" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
              Security
            </Link>
            <Link to="/privacy" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
              Privacy
            </Link>
            <Link to="/about" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
              About
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
