import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WebhookEndpoint, StorageStatus } from './types';
import { ApiClient } from './engine/client/apiClient';

// Layouts
import { PublicLayout } from './components/layout/PublicLayout';
import { AppLayout } from './components/layout/AppLayout';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { DocsPage } from './pages/DocsPage';
import { SecurityPage } from './pages/SecurityPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { AboutPage } from './pages/AboutPage';

// Workspace & Tool Pages
import { EndpointsPage } from './pages/EndpointsPage';
import { EndpointWorkspacePage } from './pages/EndpointWorkspacePage';
import { ToolsPage } from './pages/ToolsPage';
import { DiffPage } from './pages/DiffPage';
import { SignaturePage } from './pages/SignaturePage';
import { TemplatesPage } from './pages/TemplatesPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Workspace Index redirector: takes user to first active endpoint or endpoints list
function AppWorkspaceIndex({
  endpoints,
  loading,
}: {
  endpoints: WebhookEndpoint[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3 font-sans">
        <div className="w-5 h-5 border-2 border-neutral-300 border-t-neutral-800 dark:border-neutral-700 dark:border-t-neutral-200 rounded-full animate-spin"></div>
        <p className="text-xs text-neutral-500 font-mono">Loading HookLab workspace...</p>
      </div>
    );
  }

  if (endpoints.length > 0) {
    return <Navigate to={`/app/endpoints/${endpoints[0].token}`} replace />;
  }

  return <Navigate to="/app/endpoints" replace />;
}

export function App() {
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([]);
  const [activeEndpointToken, setActiveEndpointToken] = useState<string | null>(null);
  const [storageStatus, setStorageStatus] = useState<StorageStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const activeEndpoint =
    endpoints.find(e => e.token === activeEndpointToken) ||
    (endpoints.length > 0 ? endpoints[0] : null);

  // Initial load
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [statusRes, eps] = await Promise.all([
        ApiClient.getStatus().catch(() => null),
        ApiClient.listEndpoints().catch(() => []),
      ]);

      if (statusRes) {
        setStorageStatus(statusRes.storage);
      }
      setEndpoints(eps || []);
      if (eps && eps.length > 0 && !activeEndpointToken) {
        setActiveEndpointToken(eps[0].token);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  }, [activeEndpointToken]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Create new endpoint
  const handleCreateEndpoint = async (): Promise<WebhookEndpoint> => {
    try {
      const newEp = await ApiClient.createEndpoint();
      setEndpoints(prev => [newEp, ...prev]);
      setActiveEndpointToken(newEp.token);
      return newEp;
    } catch (err: any) {
      alert(`Could not create endpoint: ${err.message}`);
      throw err;
    }
  };

  // Update endpoint
  const handleUpdateEndpoint = async (token: string, updates: Partial<WebhookEndpoint>) => {
    const updated = await ApiClient.updateEndpoint(token, updates);
    setEndpoints(prev => prev.map(e => (e.token === token ? updated : e)));
  };

  // Delete endpoint
  const handleDeleteEndpoint = async (token: string) => {
    await ApiClient.deleteEndpoint(token);
    setEndpoints(prev => prev.filter(e => e.token !== token));
    if (activeEndpointToken === token) {
      const remaining = endpoints.filter(e => e.token !== token);
      setActiveEndpointToken(remaining.length > 0 ? remaining[0].token : null);
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes with Marketing/Documentation Shell */}
        <Route element={<PublicLayout />}>
          <Route index element={<LandingPage onCreateEndpoint={handleCreateEndpoint} />} />
          <Route path="docs" element={<DocsPage />} />
          <Route path="security" element={<SecurityPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="about" element={<AboutPage />} />
        </Route>

        {/* Product Workspace Routes with Observability Shell */}
        <Route
          path="app"
          element={
            <AppLayout
              endpoints={endpoints}
              activeEndpoint={activeEndpoint}
              storageStatus={storageStatus}
              onCreateEndpoint={handleCreateEndpoint}
              onDeleteEndpoint={handleDeleteEndpoint}
              onSelectEndpoint={setActiveEndpointToken}
            />
          }
        >
          {/* Main workspace index: redirects to active endpoint or endpoints list */}
          <Route index element={<AppWorkspaceIndex endpoints={endpoints} loading={loading} />} />

          {/* Endpoint management list */}
          <Route
            path="endpoints"
            element={
              <EndpointsPage
                endpoints={endpoints}
                onCreateEndpoint={handleCreateEndpoint}
                onDeleteEndpoint={handleDeleteEndpoint}
              />
            }
          />

          {/* Specific endpoint workspace (Live event stream + inspector) */}
          <Route
            path="endpoints/:endpointToken"
            element={
              <EndpointWorkspacePage
                endpoints={endpoints}
                activeEndpoint={activeEndpoint}
                onSelectEndpoint={setActiveEndpointToken}
                onUpdateEndpoint={handleUpdateEndpoint}
                onDeleteEndpoint={handleDeleteEndpoint}
              />
            }
          />

          {/* Specific endpoint requests list */}
          <Route
            path="endpoints/:endpointToken/requests"
            element={
              <EndpointWorkspacePage
                endpoints={endpoints}
                activeEndpoint={activeEndpoint}
                onSelectEndpoint={setActiveEndpointToken}
                onUpdateEndpoint={handleUpdateEndpoint}
                onDeleteEndpoint={handleDeleteEndpoint}
              />
            }
          />

          {/* Specific request inspector */}
          <Route
            path="endpoints/:endpointToken/requests/:requestId"
            element={
              <EndpointWorkspacePage
                endpoints={endpoints}
                activeEndpoint={activeEndpoint}
                onSelectEndpoint={setActiveEndpointToken}
                onUpdateEndpoint={handleUpdateEndpoint}
                onDeleteEndpoint={handleDeleteEndpoint}
              />
            }
          />

          {/* Replay workspace */}
          <Route
            path="endpoints/:endpointToken/replay"
            element={
              <EndpointWorkspacePage
                endpoints={endpoints}
                activeEndpoint={activeEndpoint}
                onSelectEndpoint={setActiveEndpointToken}
                onUpdateEndpoint={handleUpdateEndpoint}
                onDeleteEndpoint={handleDeleteEndpoint}
              />
            }
          />

          {/* Developer Tools */}
          <Route path="tools" element={<ToolsPage />} />
          <Route path="tools/diff" element={<DiffPage />} />
          <Route path="tools/signature" element={<SignaturePage />} />
          <Route path="tools/templates" element={<TemplatesPage activeEndpoint={activeEndpoint} />} />
        </Route>

        {/* Global 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
