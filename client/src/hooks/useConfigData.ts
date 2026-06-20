import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { definitions, ensureSchemasLoaded } from '../data/definitions';

// ── Safe JSON stringify helper ──────────────────────────────────────
// NOTE: safeStringify is currently unused but kept for future debugging needs
// const safeStringify = (obj: any): string => {
//     const seen = new WeakSet();
//     return JSON.stringify(obj, (_, value) => {
//         if (typeof value === 'object' && value !== null) {
//             if (seen.has(value)) {
//                 return '[Circular]';
//             }
//             seen.add(value);
//         }
//         return value;
//     });
// };

const migrateDataRecursive = (obj: any): any => {
    if (Array.isArray(obj)) return obj.map(migrateDataRecursive);
    if (obj !== null && typeof obj === 'object') {
        const newObj: any = {};
        Object.keys(obj).forEach(key => {
            const newKey = key === 'components' ? 'widgets' : key;
            newObj[newKey] = migrateDataRecursive(obj[key]);
        });
        return newObj;
    }
    return obj;
};

const migrateLayoutToPage = (obj: any): any => {
    if (Array.isArray(obj)) return obj.map(migrateLayoutToPage);
    if (obj !== null && typeof obj === 'object') {
        const newObj: any = {};
        Object.keys(obj).forEach(key => {
            const newKey = key.endsWith('Layout') ? key.replace(/Layout$/, 'Page') : key;
            newObj[newKey] = migrateLayoutToPage(obj[key]);
        });
        return newObj;
    }
    return obj;
};

const hasComponentsKey = (obj: any): boolean => {
    if (Array.isArray(obj)) return obj.some(hasComponentsKey);
    if (obj !== null && typeof obj === 'object') {
        if (obj['components']) return true;
        return Object.values(obj).some(hasComponentsKey);
    }
    return false;
};

const hasLayoutKey = (obj: any): boolean => {
    if (Array.isArray(obj)) return obj.some(hasLayoutKey);
    if (obj !== null && typeof obj === 'object') {
        if (Object.keys(obj).some(k => k.endsWith('Layout'))) return true;
        return Object.values(obj).some(hasLayoutKey);
    }
    return false;
};

const buildInitialData = () => {
    const initialData: any = {};
    if (definitions && definitions.length > 0) {
        definitions.forEach(def => {
            initialData[def.fileName] = JSON.parse(JSON.stringify(def.defaultValue));
        });
    }
    return initialData;
};

const loadFromServer = async (authFetch: (url: string, options?: RequestInit) => Promise<Response>): Promise<{ [fileName: string]: any }> => {
    try {
        const response = await authFetch('/api/configs?' + Date.now());

        if (response.ok) {
            const data = await response.json();
            console.log('Loaded configs from server:', Object.keys(data.files || {}));
            return data.files || buildInitialData();
        } else {
            console.error('Failed to load configs from server:', response.status);
            return buildInitialData();
        }
    } catch (error) {
        console.error('Error loading configs from server:', error);
        return buildInitialData();
    }
};

// ── Nested update utility ──────────────────────────────────────────

const updateNested = (obj: any, path: string[], value: any): any => {
    if (path.length === 0) return value;
    const [head, ...tail] = path;
    const newObj = Array.isArray(obj) ? [...obj] : { ...obj };
    newObj[head] = updateNested(newObj[head], tail, value);
    return newObj;
};

// ── Hook ───────────────────────────────────────────────────────────

export function useConfigData() {
    const [configData, setConfigData] = useState<{ [fileName: string]: any }>({});
    const [originalData, setOriginalData] = useState<{ [fileName: string]: any }>({});
    const [isLoading, setIsLoading] = useState(true);
    const [forceReloadKey, setForceReloadKey] = useState(0);
    const { authFetch, isAuthenticated, isLoading: authLoading } = useAuth();

    const reloadConfigs = () => {
        setForceReloadKey(prev => prev + 1);
    };

    // Load configs from server only after auth is confirmed
    useEffect(() => {
        let mounted = true;
        const maxRetries = 10;
        const retryDelay = 500;

        const loadConfigs = async () => {
            // Wait for auth to finish loading
            if (authLoading) {
                return;
            }

            // Only load configs if authenticated
            if (!isAuthenticated) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);

            try {
                // Wait for schemas to be loaded
                await ensureSchemasLoaded();

                // Retry fetching configs until we get data
                for (let i = 0; i < maxRetries; i++) {
                    try {
                        const serverData = await loadFromServer(authFetch);
                        if (mounted && Object.keys(serverData).length > 0) {
                            setConfigData(serverData);
                            setOriginalData(serverData);
                            setIsLoading(false);
                            return;
                        }
                        console.log(`Retry ${i + 1}/${maxRetries}: No config data yet`);
                        await new Promise(resolve => setTimeout(resolve, retryDelay));
                    } catch (error) {
                        console.error(`Retry ${i + 1}/${maxRetries}: Error loading configs`, error);
                        if (i === maxRetries - 1) throw error;
                        await new Promise(resolve => setTimeout(resolve, retryDelay));
                    }
                }

                if (mounted) {
                    console.warn('Failed to load configs after retries, using empty state');
                    const initialData = buildInitialData();
                    setConfigData(initialData);
                    setOriginalData(initialData);
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Failed to load configs:', error);
                if (mounted) {
                    setConfigData(buildInitialData());
                    setIsLoading(false);
                }
            }
        };

        loadConfigs();

        return () => {
            mounted = false;
        };
    }, [isAuthenticated, authLoading, authFetch, forceReloadKey]);

    const handleValueChange = (activeTab: string, path: string[], value: any) => {
        setConfigData(prev => ({
            ...prev,
            [activeTab]: updateNested(prev[activeTab], path, value),
        }));
    };

    const handleReset = () => {
        if (window.confirm("Are you sure you want to reset all files to their original defaults? This will erase all your current changes.")) {
            const initialData = buildInitialData();
            setConfigData(initialData);
        }
    };

    const hasChanges = () => {
        return JSON.stringify(configData) !== JSON.stringify(originalData);
    };

    const markAsDeployed = () => {
        setOriginalData(JSON.parse(JSON.stringify(configData)));
    };

    return {
        configData,
        setConfigData,
        setOriginalData,
        handleValueChange,
        handleReset,
        hasChanges,
        markAsDeployed,
        reloadConfigs,
        isLoading,
    };
}
