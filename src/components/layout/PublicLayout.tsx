import React, { useState } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import { ThemeToggle } from '../common/ThemeToggle';
import {
  ArrowRight,
  Menu,
  X,
  Radio,
  Shield,
  FileCode,
  Layers,
  KeyRound,
  GitCompare,
  Terminal,
  Activity,
  Sliders,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { HookScopeLogo } from '../brand/HookScopeLogo';

export const PublicLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productMenuOpen, setProductMenuOpen] = useState(false);
  const BANNER_STORAGE_KEY = 'hookscope_top_banner_dismissed_v1_2';
  const [bannerDismissed, setBannerDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem(BANNER_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const handleDismissBanner = () => {
    setBannerDismissed(true);
    try {
      localStorage.setItem(BANNER_STORAGE_KEY, 'true');
    } catch {
      // Ignore storage errors
    }
  };

  const location = useLocation();

  const productFeatures = [
    {
      title: 'Webhook Inspector',
      description: 'Capture and inspect incoming HTTP requests live in your browser.',
      path: '/app',
      icon: Radio,
    },
    {
      title: 'Request Replay',
      description: 'Forward captured webhooks safely to your local or remote server.',
      path: '/app',
      icon: Shield,
    },
    {
      title: 'Response Simulator',
      description: 'Test upstream retry behavior with custom HTTP status codes and delays.',
      path: '/app',
      icon: Sliders,
    },
    {
      title: 'Signature Verifier',
      description: 'Verify webhook signatures securely in your browser without exposing keys.',
      path: '/app/tools/signature',
      icon: KeyRound,
    },
    {
      title: 'Payload Diff',
      description: 'Compare two webhook events side by side to detect schema changes.',
      path: '/app/tools/diff',
      icon: GitCompare,
    },
    {
      title: 'Event Templates',
      description: 'Test endpoints with ready-made payloads from Stripe, GitHub, Shopify, and Slack.',
      path: '/app/tools/templates',
      icon: Layers,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans selection:bg-neutral-200 dark:selection:bg-neutral-800">
      {/* Top Banner Notice */}
      {!bannerDismissed && (
        <aside
          role="region"
          aria-label="Announcement"
          className="relative bg-neutral-900 dark:bg-[#0c0d0e] border-b border-neutral-800 text-neutral-300 text-2xs py-2 px-9 sm:px-12 text-center select-none"
        >
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-2 flex-wrap text-2xs">
            <span className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-400 font-mono text-3xs font-semibold">
              v1.2 Released
            </span>
            <span>Instant webhook capture, mock responses, and safe request replay.</span>
            <Link
              to="/docs"
              className="text-white font-medium hover:underline inline-flex items-center gap-0.5 ml-1"
            >
              <span>View guide</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </Link>
          </div>

          <button
            type="button"
            onClick={handleDismissBanner}
            aria-label="Close announcement banner"
            title="Close announcement banner"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-white rounded-md hover:bg-neutral-800/80 transition-colors cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </aside>
      )}

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#121214]/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          {/* Brand */}
          <div className="flex items-center gap-6">
            <Link to="/" className="focus:outline-hidden">
              <HookScopeLogo />
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 text-xs font-medium">
              {/* Product Popover Trigger */}
              <div
                className="relative"
                onMouseEnter={() => setProductMenuOpen(true)}
                onMouseLeave={() => setProductMenuOpen(false)}
              >
                <button
                  type="button"
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    productMenuOpen
                      ? 'text-neutral-950 dark:text-neutral-50 bg-neutral-100 dark:bg-neutral-800/60'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                  }`}
                  aria-expanded={productMenuOpen}
                >
                  <span>Features</span>
                  <ChevronDown className="w-3 h-3 text-neutral-400" />
                </button>

                {/* Dropdown Menu */}
                {productMenuOpen && (
                  <div className="absolute top-full left-0 w-80 p-2 bg-white dark:bg-[#161619] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl space-y-1 animate-in fade-in zoom-in-95 duration-100 z-50">
                    <div className="flex items-center justify-between px-2 pt-1 pb-1.5 border-b border-neutral-100 dark:border-neutral-800 text-3xs font-mono uppercase text-neutral-400">
                      <span>Platform Features</span>
                      <button
                        type="button"
                        onClick={() => setProductMenuOpen(false)}
                        aria-label="Close features menu"
                        title="Close"
                        className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-0.5 rounded transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {productFeatures.map(feat => (
                      <Link
                        key={feat.title}
                        to={feat.path}
                        onClick={() => setProductMenuOpen(false)}
                        className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/70 transition-colors group"
                      >
                        <div className="w-7 h-7 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/40 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          <feat.icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-neutral-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {feat.title}
                          </div>
                          <div className="text-3xs text-neutral-500 leading-snug">
                            {feat.description}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <NavLink
                to="/docs"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg transition-colors ${
                    isActive
                      ? 'text-neutral-950 dark:text-neutral-50 font-semibold bg-neutral-100 dark:bg-neutral-800/60'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                  }`
                }
              >
                Docs
              </NavLink>

              <NavLink
                to="/app/tools"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg transition-colors ${
                    isActive
                      ? 'text-neutral-950 dark:text-neutral-50 font-semibold bg-neutral-100 dark:bg-neutral-800/60'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                  }`
                }
              >
                Tools
              </NavLink>

              <NavLink
                to="/security"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg transition-colors ${
                    isActive
                      ? 'text-neutral-950 dark:text-neutral-50 font-semibold bg-neutral-100 dark:bg-neutral-800/60'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                  }`
                }
              >
                Security
              </NavLink>

              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg transition-colors ${
                    isActive
                      ? 'text-neutral-950 dark:text-neutral-50 font-semibold bg-neutral-100 dark:bg-neutral-800/60'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                  }`
                }
              >
                About
              </NavLink>
            </nav>
          </div>

          {/* Right Header Section: System Status + Theme Toggle + CTA */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Status indicator */}
            <div className="hidden lg:flex items-center gap-1.5 text-3xs font-mono text-neutral-500 border border-neutral-200 dark:border-neutral-800 px-2 py-1 rounded-md bg-neutral-50/50 dark:bg-[#161619]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Ingestion Active</span>
            </div>

            <ThemeToggle />

            <Link
              to="/app"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-white transition-colors shadow-2xs"
            >
              <span>Open Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121214] px-4 py-4 space-y-3 shadow-xl animate-in fade-in duration-150 max-h-[85vh] overflow-y-auto">
            {/* Direct Links */}
            <div className="space-y-1">
              <NavLink
                to="/app"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
              >
                <span>Launch Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </NavLink>

              <NavLink
                to="/docs"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-xs font-medium rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Documentation & Guides
              </NavLink>

              <NavLink
                to="/app/tools"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-xs font-medium rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Developer Utilities & Tools
              </NavLink>

              <NavLink
                to="/security"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-xs font-medium rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Security Architecture & SSRF Guard
              </NavLink>

              <NavLink
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-xs font-medium rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                About HookScope
              </NavLink>

              <NavLink
                to="/privacy"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-xs font-medium rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Privacy & Data Retention
              </NavLink>
            </div>

            {/* Quick Feature Shortcuts */}
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
              <span className="text-3xs uppercase tracking-wider font-mono text-neutral-400 px-3 block mb-1">
                Developer Utilities
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <Link
                  to="/app/tools/signature"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 border border-neutral-200 dark:border-neutral-800 rounded-lg text-2xs font-mono text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                >
                  HMAC Verifier
                </Link>
                <Link
                  to="/app/tools/diff"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 border border-neutral-200 dark:border-neutral-800 rounded-lg text-2xs font-mono text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                >
                  Payload Diff
                </Link>
                <Link
                  to="/app/tools/templates"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 border border-neutral-200 dark:border-neutral-800 rounded-lg text-2xs font-mono text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                >
                  Event Templates
                </Link>
                <Link
                  to="/app/endpoints"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 border border-neutral-200 dark:border-neutral-800 rounded-lg text-2xs font-mono text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                >
                  All Endpoints
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Outlet */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* Comprehensive Enterprise-Grade Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121214] font-sans">
        {/* Top Footer Columns */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10">
          {/* Column 1: Brand & Identity */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block focus:outline-hidden">
              <HookScopeLogo iconSize="md" />
            </Link>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-sm">
              Real-time webhook inspection, testing, and replay. Create instant public endpoints, inspect headers and payloads live, and debug API integrations with confidence.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-3xs font-mono bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>All systems operational</span>
              </div>
            </div>

            <p className="text-3xs text-neutral-400 font-mono">
              No account required · Automated 24h data purge · SSRF protected
            </p>
          </div>

          {/* Column 2: Platform Features */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 font-mono">
              Platform
            </h3>
            <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
              <li>
                <Link to="/app" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Live Stream Inbox
                </Link>
              </li>
              <li>
                <Link to="/app" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  SSRF-Guarded Replay
                </Link>
              </li>
              <li>
                <Link to="/app" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Custom HTTP Mock Rules
                </Link>
              </li>
              <li>
                <Link to="/app/tools/signature" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  HMAC Signature Verifier
                </Link>
              </li>
              <li>
                <Link to="/app/tools/diff" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  JSON Payload Diff Engine
                </Link>
              </li>
              <li>
                <Link to="/app/tools/templates" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Simulated Event Templates
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Documentation & Guides */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 font-mono">
              Documentation
            </h3>
            <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
              <li>
                <Link to="/docs" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Getting Started Guide
                </Link>
              </li>
              <li>
                <Link to="/docs" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Ingestion URL Patterns
                </Link>
              </li>
              <li>
                <Link to="/docs" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  SSRF Validation Rules
                </Link>
              </li>
              <li>
                <Link to="/docs" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Vercel Serverless Setup
                </Link>
              </li>
              <li>
                <Link to="/docs" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Redis Persistence Config
                </Link>
              </li>
              <li>
                <Link to="/docs" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  HTTP Status Simulation
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Trust & Company */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 font-mono">
              Trust & System
            </h3>
            <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
              <li>
                <Link to="/security" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Security Architecture
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Privacy Policy & Retention
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Product Overview & Story
                </Link>
              </li>
              <li>
                <Link to="/app/endpoints" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Workspace Dashboard
                </Link>
              </li>
              <li>
                <span className="text-neutral-400 dark:text-neutral-600 cursor-not-allowed">
                  Open Source on GitHub
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-100 dark:border-neutral-800/80 py-5 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-3 text-2xs text-neutral-500 font-mono">
            <div>
              © 2026 HookScope. Engineered for high-reliability webhook testing and inspection.
            </div>
            <div className="flex items-center gap-4">
              <span>TypeScript + React 19</span>
              <span>·</span>
              <span>Web Crypto API</span>
              <span>·</span>
              <span>Vercel Edge Ready</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
