import React, { useState, useRef, useEffect, useMemo } from 'react';
import { NavLink, Link, Outlet, useNavigate, useLocation, useParams } from 'react-router-dom';
import { ThemeToggle } from '../common/ThemeToggle';
import { WebhookEndpoint, StorageStatus } from '../../types';
import { getPublicEndpointUrl } from '../../utils/url';
import { CopyButton } from '../common/CopyButton';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { HookLabLogo } from '../brand/HookLabLogo';
import {
  ChevronDown,
  Plus,
  Radio,
  Layers,
  Wrench,
  FileCode,
  Activity,
  Menu,
  X,
  Trash2,
} from 'lucide-react';

interface AppLayoutProps {
  endpoints: WebhookEndpoint[];
  activeEndpoint: WebhookEndpoint | null;
  storageStatus: StorageStatus | null;
  onCreateEndpoint: () => Promise<WebhookEndpoint | void>;
  onRequestCreateEndpoint?: () => void;
  onDeleteEndpoint: (token: string) => Promise<void>;
  onSelectEndpoint: (token: string) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  endpoints,
  activeEndpoint,
  storageStatus,
  onCreateEndpoint,
  onRequestCreateEndpoint,
  onDeleteEndpoint,
  onSelectEndpoint,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tokenToDelete, setTokenToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Deduplicate endpoints for dropdown
  const uniqueEndpoints = useMemo(() => {
    const map = new Map<string, WebhookEndpoint>();
    for (const ep of endpoints) {
      if (ep?.token) map.set(ep.token, ep);
    }
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [endpoints]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleConfirmDelete = async () => {
    if (!tokenToDelete || isDeleting) return;
    setIsDeleting(true);
    try {
      await onDeleteEndpoint(tokenToDelete);
    } finally {
      setIsDeleting(false);
      setTokenToDelete(null);
    }
  };

  const activeUrl = activeEndpoint ? getPublicEndpointUrl(activeEndpoint.token) : '';

  // Breadcrumbs generator based on location
  const pathParts = location.pathname.split('/').filter(Boolean);
  const isWorkspace = pathParts.includes('endpoints') && pathParts.length >= 3;
  const currentToken = isWorkspace ? pathParts[2] : null;

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans selection:bg-neutral-200 dark:selection:bg-neutral-800">
      {/* Top Application Header */}
      <header className="sticky top-0 z-40 w-full bg-white dark:bg-[#121214] border-b border-neutral-200 dark:border-neutral-800 shrink-0 select-none">
        <div className="max-w-full px-3 sm:px-5 flex items-center justify-between h-13 gap-3">
          {/* Left: Brand + Contextual Endpoint Switcher */}
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/app" className="focus:outline-hidden">
              <HookLabLogo />
            </Link>

            <span className="text-neutral-300 dark:text-neutral-700 hidden sm:inline">/</span>

            {/* Endpoint Selector Dropdown */}
            {activeEndpoint && (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-2.5 py-1 text-xs font-mono rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#18181b] hover:bg-neutral-100 dark:hover:bg-[#1f1f23] transition-colors max-w-xs sm:max-w-sm truncate"
                  aria-expanded={dropdownOpen}
                >
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>

                  <span className="truncate text-neutral-900 dark:text-neutral-100 font-medium">
                    /h/{activeEndpoint.token}
                  </span>

                  <span className="text-2xs text-neutral-400 font-sans hidden md:inline">
                    Listening
                  </span>

                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0 ml-0.5" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute left-0 top-full mt-1.5 w-72 sm:w-80 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#18181b] shadow-xl py-1.5 z-50 text-xs">
                    <div className="px-3 py-1.5 border-b border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
                      <span className="text-2xs font-mono uppercase text-neutral-400">
                        Active Endpoints ({uniqueEndpoints.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false);
                          if (onRequestCreateEndpoint) {
                            onRequestCreateEndpoint();
                          } else {
                            onCreateEndpoint().then(ep => {
                              if (ep) navigate(`/app/endpoints/${ep.token}`);
                            });
                          }
                        }}
                        className="inline-flex items-center gap-1 text-2xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Create New</span>
                      </button>
                    </div>

                    <div className="max-h-60 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/60 py-1">
                      {uniqueEndpoints.map(ep => {
                        const isCurrent = ep.token === activeEndpoint.token;
                        return (
                          <div
                            key={ep.token}
                            onClick={() => {
                              onSelectEndpoint(ep.token);
                              setDropdownOpen(false);
                              navigate(`/app/endpoints/${ep.token}`);
                            }}
                            className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors ${
                              isCurrent
                                ? 'bg-neutral-100/70 dark:bg-neutral-800/60 font-semibold'
                                : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/30'
                            }`}
                          >
                            <div className="min-w-0 flex-1 pr-2">
                              <span className="font-mono text-xs text-neutral-900 dark:text-neutral-100 truncate block">
                                /h/{ep.token}
                              </span>
                              <span className="text-2xs text-neutral-400 font-sans truncate block">
                                {ep.name || 'Webhook endpoint'}
                              </span>
                            </div>

                            {uniqueEndpoints.length > 1 && (
                              <button
                                type="button"
                                onClick={e => {
                                  e.stopPropagation();
                                  setTokenToDelete(ep.token);
                                }}
                                className="p-1 text-neutral-400 hover:text-rose-500 rounded"
                                title="Delete endpoint"
                                aria-label={`Delete endpoint ${ep.name || ep.token}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick Copy */}
            {activeUrl && (
              <div className="hidden lg:flex items-center">
                <CopyButton text={activeUrl} label="Copy URL" />
              </div>
            )}
          </div>

          {/* Center Navigation Links using NavLink */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-medium">
            <NavLink
              to="/app/endpoints"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-semibold shadow-2xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
                }`
              }
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Workspace</span>
            </NavLink>

            <NavLink
              to="/app/tools"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-semibold shadow-2xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
                }`
              }
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Tools</span>
            </NavLink>

            <NavLink
              to="/docs"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-semibold shadow-2xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
                }`
              }
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Docs</span>
            </NavLink>
          </nav>

          {/* Right Section: Theme Toggle, New Endpoint button, Mobile menu */}
          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle />

            <button
              type="button"
              onClick={async () => {
                const ep = await onCreateEndpoint();
                if (ep) {
                  navigate(`/app/endpoints/${ep.token}`);
                }
              }}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-white transition-colors whitespace-nowrap shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Endpoint</span>
            </button>

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-neutral-600 dark:text-neutral-400"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121214] px-4 py-3 space-y-1">
            <NavLink
              to="/app/endpoints"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 text-xs font-medium rounded-lg ${
                  isActive
                    ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400'
                }`
              }
            >
              Workspace & Endpoints
            </NavLink>
            <NavLink
              to="/app/tools"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 text-xs font-medium rounded-lg ${
                  isActive
                    ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400'
                }`
              }
            >
              Developer Tools
            </NavLink>
            <NavLink
              to="/docs"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 text-xs font-medium rounded-lg ${
                  isActive
                    ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400'
                }`
              }
            >
              Documentation
            </NavLink>
          </div>
        )}
      </header>

      {/* Main App Workspace Outlet */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        <Outlet />
      </main>

      {/* Application Footer */}
      <footer className="h-7 px-4 bg-white dark:bg-[#121214] border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-3xs text-neutral-500 font-mono shrink-0 select-none">
        <div className="flex items-center gap-2">
          <span>HookLab</span>
          <span>·</span>
          <span>Webhook Observability Workspace</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/security" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
            Security
          </Link>
          <Link to="/privacy" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
            Privacy
          </Link>
          <Link to="/docs" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
            Docs
          </Link>
        </div>
      </footer>

      {/* Accessible In-App Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={tokenToDelete !== null}
        title="Delete endpoint?"
        message="Requests stored for this endpoint will also be removed according to the application's retention/storage behavior."
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete endpoint'}
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setTokenToDelete(null)}
      />
    </div>
  );
};
