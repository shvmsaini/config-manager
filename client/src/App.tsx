
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import { definitions, ensureSchemasLoaded } from './data/definitions';
import { RecursiveConfigEditor } from './components/config-editor/RecursiveConfigEditor';
import { JsonEditor } from './components/JsonEditor';
import { useConfigData } from './hooks/useConfigData';
import { useDeployment } from './hooks/useDeployment';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewPanel } from './components/OverviewPanel';
import { MobileMenu } from './components/MobileMenu';
import { DeployToast } from './components/DeployToast';
import './index.css';

function ConfigManager() {
  const { logout } = useAuth();

  // Feature flags
  const SHOW_COMPACT_TOGGLE = false;
  const SHOW_RESET = true;
  const SHOW_DARK_MODE = false;

  // ── UI state ──────────────────────────────────────────────────
  const [ready, setReady] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('');
  const [showRawJson, setShowRawJson] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('dark_mode');
    return saved === 'true';
  });

  // ── Persist UI preferences ────────────────────────────────────

  useEffect(() => {
    localStorage.setItem('dark_mode', isDarkMode.toString());
    
    const colorScheme = isDarkMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-color-scheme', colorScheme);
    document.querySelector('meta[name="color-scheme"]')?.setAttribute('content', colorScheme);
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // Load server schemas on mount
  useEffect(() => {
    let mounted = true;

    const loadSchemas = async () => {
      try {
        console.log('Loading server schemas...');
        await ensureSchemasLoaded();
        if (mounted) {
          console.log('Schemas loaded, definitions:', definitions.length);
          setReady(true);
          // Set initial tab
          if (definitions.length > 0) {
            setActiveTab(definitions[0].fileName);
          }
        }
      } catch (error) {
        console.error('Failed to load schemas:', error);
        if (mounted) {
          setReady(true);
        }
      }
    };

    loadSchemas();

    return () => {
      mounted = false;
    };
  }, []);

  // ── Data hooks ────────────────────────────────────────────────
  const {
    configData,
    setConfigData,
    setOriginalData: _setOriginalData,
    handleValueChange,
    handleReset,
    hasChanges,
    markAsDeployed: _markAsDeployed,
    reloadConfigs,
    isLoading,
  } = useConfigData();

  const isReadyFromHook = !isLoading && Object.keys(configData).length > 0;

  const {
    isDeploying,
    deployResult,
    setDeployResult,
    handleDeploy,
    handleDownload,
  } = useDeployment(configData, () => {
    setTimeout(() => {
      reloadConfigs();
    }, 200);
  });

  // Show loading state while fetching schemas and configs
  if (!ready || isLoading || !isReadyFromHook || definitions.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-m3-surface">
        <div className="text-m3-on-surface text-center">
          <div className="animate-spin w-12 h-12 border-4 border-m3-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg font-medium">
            {!ready ? 'Loading schemas...' : 'Loading configurations...'}
          </p>
        </div>
      </div>
    );
  }

  // ── Derived state ─────────────────────────────────────────────
  const activeDefinition = definitions.find(d => d.fileName === activeTab)!;
  const overviewItems = Object.keys(configData[activeTab] || {});

  // ── Bound handlers ────────────────────────────────────────────
  const onValueChange = (path: string[], value: any) =>
    handleValueChange(activeTab, path, value);

  const handleResetWithNotification = () => {
    handleReset();
    setDeployResult({
      success: true,
      message: 'Changes reset to defaults. Deploy to apply changes.'
    });
  };

  return (
    <div className="flex h-screen bg-transparent text-m3-on-background overflow-hidden relative selection:bg-m3-primary/30">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={logout}
      />

      <div className="flex-1 flex flex-col min-w-0 bg-transparent relative">
        <Header
          activeTab={activeTab}
          showRawJson={showRawJson}
          setShowRawJson={setShowRawJson}
          onMobileMenuOpen={() => setMobileMenuOpen(true)}
          showCompactToggle={SHOW_COMPACT_TOGGLE}
          showReset={SHOW_RESET}
          showDarkMode={SHOW_DARK_MODE}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          compactMode={compactMode}
          setCompactMode={setCompactMode}
          onReset={handleResetWithNotification}
          onDownload={handleDownload}
          onDeploy={handleDeploy}
          isDeploying={isDeploying}
          hasChanges={hasChanges()}
        />

        <div className="flex-1 flex overflow-hidden">
          {!showRawJson && <OverviewPanel items={overviewItems} />}

          <div className="flex-1 overflow-y-auto p-4 md:p-12 no-scrollbar scroll-smooth">
            <div className="max-w-4xl mx-auto pb-32 md:pb-32">
              {showRawJson ? (
                <div className="bg-m3-surface rounded-2xl md:rounded-3xl border-[3px] border-m3-outline shadow-m3-3 relative">
                  <JsonEditor
                    value={configData[activeTab]}
                    onChange={(n: any) => setConfigData(prev => ({ ...prev, [activeTab]: n }))}
                    onDeploy={(parsed) => handleDeploy({ ...configData, [activeTab]: parsed })}
                  />
                </div>
              ) : (
                <div className="space-y-6 md:space-y-10 animate-in zoom-in-95 fade-in duration-500">
                  <RecursiveConfigEditor
                    items={activeDefinition.items}
                    values={configData[activeTab]}
                    onChange={onValueChange}
                    compact={compactMode}
                    allData={configData}
                    activeTab={activeTab}
                    setActiveTab={(tab: string) => {
                      setActiveTab(tab);
                      setShowRawJson(false);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={logout}
      />

      <DeployToast
        result={deployResult}
        onDismiss={() => setDeployResult(null)}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ConfigManager />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
