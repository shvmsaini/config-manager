import { useState } from 'react';
import JSZip from 'jszip';
import { useAuth } from '../context/AuthContext';

// ── Safe JSON stringify helper ──────────────────────────────────────

const safeStringify = (obj: any): string => {
    const seen = new WeakSet();
    return JSON.stringify(obj, (_, value) => {
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
                return '[Circular]';
            }
            seen.add(value);
        }
        return value;
    });
};

interface DeployResult {
    success: boolean;
    message: string;
}

export function useDeployment(
    configData: { [fileName: string]: any },
    onDeploySuccess?: () => void
) {
    const [isDeploying, setIsDeploying] = useState(false);
    const [deployResult, setDeployResult] = useState<DeployResult | null>(null);
    const { authFetch } = useAuth();

    const handleDeploy = async (filesOverride?: { [fileName: string]: any } | React.MouseEvent) => {
        setIsDeploying(true);
        setDeployResult(null);
        try {
            // Ignore event objects
            if (filesOverride && typeof filesOverride === 'object' && 'nativeEvent' in filesOverride) {
                filesOverride = undefined;
            }

            const files = filesOverride || configData;

            const response = await authFetch('/api/deploy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: safeStringify({ files }),
            });

            console.log('Response status:', response.status);
            console.log('Response content-type:', response.headers.get('content-type'));

            if (!response.ok) {
                const text = await response.text();
                console.error('Error response:', text);
                throw new Error(response.statusText || text);
            }

            const data = await response.json();
            setDeployResult({
                success: response.ok,
                message: response.ok ? data.message : (data.error || 'Deploy failed'),
            });
            if (response.ok && onDeploySuccess) {
                onDeploySuccess();
            }
        } catch (error: any) {
            setDeployResult({ success: false, message: error.message || 'Network error during deployment' });
        } finally {
            setIsDeploying(false);
            setTimeout(() => setDeployResult(null), 5000);
        }
    };

    const handleDownload = async () => {
        const zip = new JSZip();
        Object.entries(configData).forEach(([fileName, content]) => {
            zip.file(fileName, JSON.stringify(content, null, 2));
        });

        try {
            const blob = await zip.generateAsync({ type: "blob" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = "config-files.zip";
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }, 100);
        } catch (err) {
            setDeployResult({ success: false, message: 'Failed to generate ZIP' });
        }
    };

    return {
        isDeploying,
        deployResult,
        setDeployResult,
        handleDeploy,
        handleDownload,
    };
}
