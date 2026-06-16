import React from 'react';
import {
    Download,
    UploadCloud,
    Code,
    Eye,
    Menu,
    Maximize2,
    Minimize2,
    RotateCcw,
    Play,
    Sun,
    Moon
} from 'lucide-react';
import { cn } from '../utils/cn';

interface HeaderProps {
    activeTab: string;
    showRawJson: boolean;
    setShowRawJson: (show: boolean) => void;
    onMobileMenuOpen: () => void;
    // Feature flags
    showCompactToggle?: boolean;
    showReset?: boolean;
    showDarkMode?: boolean;
    // Theme
    isDarkMode?: boolean;
    toggleDarkMode?: () => void;
    // Compact
    compactMode?: boolean;
    setCompactMode?: (compact: boolean) => void;
    // Actions
    onReset: () => void;
    onDownload: () => void;
    onDeploy: () => void;
    isDeploying: boolean;
    hasChanges?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
    activeTab,
    showRawJson,
    setShowRawJson,
    onMobileMenuOpen,
    showCompactToggle = false,
    showReset = true,
    showDarkMode = false,
    isDarkMode = false,
    toggleDarkMode,
    compactMode = false,
    setCompactMode,
    onReset,
    onDownload,
    onDeploy,
    isDeploying,
    hasChanges = false,
}) => {
    return (
        <header
            className={cn(
                "h-16 md:h-20 px-4 md:px-8 flex items-center justify-between shrink-0",
                "bg-m3-surface/70 backdrop-blur-xl border-b border-m3-outline border-[3px] z-40 transition-all duration-300"
            )}
        >
            <div className="flex items-center gap-4 md:gap-6">
                <button className="md:hidden p-2 -ml-2 rounded-full hover:bg-m3-on-surface/10" onClick={onMobileMenuOpen}>
                    <Menu className="w-5 h-5 md:w-6 md:h-6 text-m3-on-surface" />
                </button>
                <div className="flex flex-col">
                    <h2 className="text-xl md:text-3xl font-bold text-m3-primary tracking-tight flex items-center gap-3 truncate">
                        {activeTab.replace('.json', '').toUpperCase()}
                    </h2>
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
                {/* Dark Mode Toggle */}
                {showDarkMode && toggleDarkMode && (
                    <button
                        onClick={toggleDarkMode}
                        className="h-11.5 px-3.5 rounded-full bg-m3-surface-variant/30 hover:bg-m3-primary hover:text-m3-on-primary hover:border-m3-primary text-m3-on-surface transition-all border-[3px] border-m3-outline flex items-center justify-center shadow-hover hover:shadow-m3-2 hover:-translate-y-0.5"
                        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {isDarkMode ? <Sun className="w-4 h-4 md:w-5 md:h-5" /> : <Moon className="w-4 h-4 md:w-5 md:h-5" />}
                    </button>
                )}

                {/* Reset Button */}
                {showReset && (
                    <button
                        onClick={onReset}
                        className="hidden md:flex items-center gap-2 px-6 h-11.5 rounded-full bg-m3-surface-variant/30 hover:bg-m3-error/10 hover:text-m3-error hover:border-m3-error transition-all border-[3px] border-m3-outline text-m3-on-surface text-xs font-bold tracking-widest uppercase"
                        title="Reset all to defaults"
                    >
                        <RotateCcw className="w-4 h-4" />
                        <span className="hidden lg:inline">Reset</span>
                    </button>
                )}

                {/* Compact Toggle */}
                {showCompactToggle && setCompactMode && (
                    <button
                        onClick={() => setCompactMode(!compactMode)}
                        className="hidden md:flex h-11.5 px-4 rounded-full bg-m3-surface-variant/30 hover:bg-m3-surface-variant/50 text-m3-on-surface transition-all border-[3px] border-m3-outline items-center justify-center"
                        title={compactMode ? "Comfort View" : "Compact View"}
                    >
                        {compactMode ? <Maximize2 className="w-5 h-5" /> : <Minimize2 className="w-5 h-5" />}
                    </button>
                )}

                <div className="hidden md:h-8 w-px bg-m3-outline/20 mx-2" />

                {/* View Mode Toggle */}
                <div className="flex bg-m3-surface-variant/50 rounded-full p-1.5 border-[3px] border-m3-outline shadow-inner">
                    <button
                        onClick={() => setShowRawJson(false)}
                        className={cn(
                            "flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all",
                            !showRawJson
                                ? "bg-m3-primary text-m3-on-primary shadow-m3-2"
                                : "text-m3-on-surface-variant hover:text-m3-on-surface"
                        )}
                    >
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">Visual</span>
                    </button>
                    <button
                        onClick={() => setShowRawJson(true)}
                        className={cn(
                            "flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all",
                            showRawJson
                                ? "bg-m3-primary text-m3-on-primary shadow-m3-2"
                                : "text-m3-on-surface-variant hover:text-m3-on-surface"
                        )}
                    >
                        <Code className="w-4 h-4" />
                        <span className="hidden sm:inline">JSON</span>
                    </button>
                </div>

                <div className="hidden md:h-8 w-px bg-m3-outline/20 mx-2" />

                {/* Deploy / Download */}
                <div className="hidden md:flex items-center gap-3">
                    <button
                        onClick={onDownload}
                        className="flex items-center gap-2 px-6 h-11.5 rounded-full bg-m3-surface-variant/30 hover:bg-emerald-500/10 hover:text-emerald-600 transition-all border-[3px] border-m3-outline text-m3-on-surface text-xs font-bold tracking-widest uppercase shadow-m3-2 hover:shadow-m3-3 hover:border-emerald-600/50 active:shadow-m3-1"
                        title="Download as ZIP"
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden lg:inline">Download</span>
                    </button>

                    <button
                        onClick={onDeploy}
                        disabled={isDeploying || !hasChanges}
                        className={cn(
                            "flex items-center gap-2 px-6 md:px-8 h-11.5 rounded-full transition-all text-xs font-bold tracking-widest uppercase shadow-m3-2 hover:shadow-m3-3",
                            isDeploying || !hasChanges
                                ? "bg-m3-surface-variant text-m3-on-surface-variant/40 cursor-not-allowed pointer-events-none"
                                : "bg-emerald-600 hover:bg-emerald-700 text-white"
                        )}
                        title="Save and Deploy Config"
                    >
                        {isDeploying ? (
                            <UploadCloud className="w-4 h-4 animate-bounce" />
                        ) : (
                            <Play className="w-4 h-4 fill-current" />
                        )}
                        <span className="hidden md:inline">{hasChanges ? (isDeploying ? 'DEPLOYING...' : 'DEPLOY') : 'NO CHANGES'}</span>
                    </button>
                </div>

                {/* Mobile-only action buttons */}
                <div className="flex md:hidden items-center gap-1">
                    <button
                        onClick={onDeploy}
                        disabled={isDeploying || !hasChanges}
                        className={cn(
                            "h-11.5 w-11.5 rounded-full flex items-center justify-center transition-all",
                            isDeploying || !hasChanges
                                ? "bg-m3-surface-variant text-m3-on-surface-variant/40 cursor-not-allowed pointer-events-none"
                                : "bg-emerald-600 hover:bg-emerald-700 text-white"
                        )}
                        title="Deploy"
                    >
                        {isDeploying ? (
                            <UploadCloud className="w-5 h-5 animate-bounce" />
                        ) : (
                            <Play className="w-5 h-5 fill-current" />
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
};
