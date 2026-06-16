import React, { useState, useEffect } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-json';
import 'prismjs/themes/prism.css';
import { AlertTriangle, Check, X, Undo, Eye } from 'lucide-react';

interface JsonEditorProps {
    value: any;
    onChange: (value: any) => void;
    onDeploy?: (parsed?: any) => void;
}

interface DiffLine {
    type: 'added' | 'removed' | 'unchanged';
    text: string;
    lineNumOriginal?: number;
    lineNumCurrent?: number;
}

export const JsonEditor: React.FC<JsonEditorProps> = ({ value, onChange, onDeploy }) => {

    // ── Diff Algorithm (LCS - Longest Common Subsequence) ─────────────────────────────
    const computeLineDiff = (original: string, current: string): DiffLine[] => {
        const one = original.split('\n');
        const two = current.split('\n');

        const n = one.length;
        const m = two.length;

        const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

        for (let i = 1; i <= n; i++) {
            for (let j = 1; j <= m; j++) {
                if (one[i - 1] === two[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                } else {
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                }
            }
        }

        const result: DiffLine[] = [];
        let i = n;
        let j = m;

        while (i > 0 || j > 0) {
            if (i > 0 && j > 0 && one[i - 1] === two[j - 1]) {
                result.push({
                    type: 'unchanged',
                    text: one[i - 1],
                    lineNumOriginal: i,
                    lineNumCurrent: j
                });
                i--;
                j--;
            } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
                result.push({
                    type: 'added',
                    text: two[j - 1],
                    lineNumCurrent: j
                });
                j--;
            } else {
                result.push({
                    type: 'removed',
                    text: one[i - 1],
                    lineNumOriginal: i
                });
                i--;
            }
        }

        return result.reverse();
    };

    // ── Component State ──────────────────────────────────────────────────────────────
    const [code, setCode] = useState(() => JSON.stringify(value, null, 2));
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Compute original formatted string representation to detect modifications
    const originalCode = JSON.stringify(value, null, 2);
    const hasUnsavedChanges = code !== originalCode && !error;

    // Compute diff lines continuously
    const diffLines = computeLineDiff(originalCode, code);
    const changedLinesOnly = diffLines.filter(line => line.type !== 'unchanged');

    // Refresh local editor code state when prop changes from parent
    useEffect(() => {
        try {
            const currentObj = JSON.parse(code);
            if (JSON.stringify(currentObj) !== JSON.stringify(value)) {
                setCode(JSON.stringify(value, null, 2));
            }
        } catch (e) {
            setCode(JSON.stringify(value, null, 2));
        }
        setError(null);
    }, [value]);

    // Handle local text editing - validate syntax but DO NOT trigger global onChange
    const handleValueChange = (newCode: string) => {
        setCode(newCode);
        try {
            JSON.parse(newCode);
            setError(null);
        } catch (err: any) {
            setError(err.message);
        }
    };

    // Revert local changes back to the last saved original state
    const handleDiscard = () => {
        setCode(originalCode);
        setError(null);
    };

    // Save modifications - parse and invoke parent's onChange
    const handleSave = () => {
        try {
            const parsed = JSON.parse(code);
            setError(null);
            setIsModalOpen(false);
            onChange(parsed);
            if (onDeploy) {
                onDeploy(parsed);
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="w-full bg-m3-surface font-mono text-sm relative rounded-3xl min-h-[500px]">
            {/* Sticky Header: Danger zone badge */}
            <div className="sticky top-0 z-30 pt-4 px-4 w-full bg-gradient-to-b from-m3-surface via-m3-surface/95 to-transparent pb-4 pointer-events-none rounded-t-3xl">
                <div className="bg-m3-error/90 backdrop-blur-xl text-white px-5 py-3 rounded-2xl flex items-center gap-4 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.3)] border border-white/20 pointer-events-auto">
                    <div className="p-2 bg-white/20 rounded-full shrink-0">
                        <AlertTriangle className="w-4 h-4 animate-pulse drop-shadow-md" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-black uppercase tracking-widest leading-none mb-1 drop-shadow-md">Raw JSON Configuration Editor</span>
                        <span className="text-[11px] opacity-90 font-medium leading-tight drop-shadow-sm">Edits bypass visual guidelines. Click Save Changes below to review a highlight diff before committing.</span>
                    </div>
                </div>
            </div>

            {/* Code editor body viewport */}
            <div className="px-4 pb-4">
                <div className="relative">
                    <Editor
                        value={code}
                        onValueChange={handleValueChange}
                        highlight={(code: string) => Prism.highlight(code, Prism.languages.json, 'json')}
                        padding={20}
                        className="msg-font font-mono text-m3-on-surface"
                        style={{
                            fontFamily: '"Fira code", "Fira Mono", monospace',
                            fontSize: 13,
                        }}
                        textareaClassName="focus:outline-none"
                    />
                </div>
            </div>

            {/* Sticky Bottom Actions Wrapper */}
            <div className={hasUnsavedChanges ? "sticky bottom-0 left-0 right-0 p-4 z-30 flex flex-col gap-3 pointer-events-none bg-gradient-to-t from-m3-surface via-m3-surface/95 to-transparent pt-8 rounded-b-3xl" : "hidden"}>
                {/* Pinned bottom bar: Unsaved changes */}
                {hasUnsavedChanges && (
                    <div className="w-full bg-[#0c182d]/95 backdrop-blur-md border border-[#0067B1]/30 rounded-2xl p-3 shadow-[0_16px_50px_rgba(0,0,0,0.4)] flex items-center justify-between gap-3 pointer-events-auto animate-in slide-in-from-bottom-6 duration-300">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#0067B1]/20 flex items-center justify-center border border-[#0067B1]/40 text-[#38bdf8] shrink-0">
                                <Eye className="w-3.5 h-3.5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-white tracking-wide leading-none mb-0.5">Unsaved Changes</p>
                                <p className="text-[10px] text-slate-400 leading-none">{changedLinesOnly.length} changed lines</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={handleDiscard}
                                className="px-3 py-1.5 text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                            >
                                <Undo className="w-3 h-3" />
                                Discard
                            </button>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#0067B1] hover:bg-[#005797] rounded-lg shadow-lg shadow-[#0067B1]/20 transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                            >
                                View Changes
                            </button>
                        </div>
                    </div>
                )}

                {/* Error bar */}
                {error && (
                    <div className="w-full p-4 bg-rose-950/95 backdrop-blur-md text-rose-200 text-xs rounded-2xl border border-rose-500/30 shadow-2xl pointer-events-auto animate-in slide-in-from-bottom-5 duration-300">
                        <div className="flex items-center gap-2 mb-1.5">
                            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                            <span className="font-black uppercase tracking-widest text-[10px] text-rose-400">Syntax Error</span>
                        </div>
                        <div className="font-mono text-xs opacity-90 leading-relaxed tabular-nums">
                            {error}
                        </div>
                    </div>
                )}
            </div>

            {/* Review Diff Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#0b1626] border border-white/10 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0">
                            <div>
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#0067B1] animate-pulse" />
                                    Review Configuration Diff
                                </h3>
                                <p className="text-[11px] text-slate-400 mt-1">Verify your line changes side-by-side before applying updates</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-1.5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Integrated Git-like Unified Diff View Body */}
                        <div className="flex-1 overflow-auto p-4 bg-slate-950/40 font-mono text-xs custom-scrollbar border-b border-white/5">
                            <div className="min-w-full space-y-[2px] whitespace-pre">
                                {diffLines.map((line, idx) => {
                                    const isAdded = line.type === 'added';
                                    const isRemoved = line.type === 'removed';

                                    return (
                                        <div
                                            key={idx}
                                            className={`flex items-start w-full py-0.5 px-2 rounded-md ${isAdded ? 'bg-emerald-500/10 text-emerald-400 font-medium' :
                                                isRemoved ? 'bg-rose-500/10 text-rose-400 line-through opacity-70' :
                                                    'text-slate-400 opacity-80'
                                                }`}
                                        >
                                            {/* Line Counter Margins */}
                                            <span className="w-9 select-none text-right text-[10px] opacity-25 pr-2 border-r border-white/5 mr-2 tabular-nums">
                                                {line.lineNumOriginal || ''}
                                            </span>
                                            <span className="w-9 select-none text-right text-[10px] opacity-25 pr-3 border-r border-white/5 mr-3 tabular-nums">
                                                {line.lineNumCurrent || ''}
                                            </span>

                                            {/* Git Signifier */}
                                            <span className={`w-4 select-none font-bold text-sm leading-none ${isAdded ? 'text-emerald-500' : isRemoved ? 'text-rose-500' : 'opacity-10'
                                                }`}>
                                                {isAdded ? '+' : isRemoved ? '-' : ' '}
                                            </span>

                                            {/* Line Text content */}
                                            <span className="flex-1 break-all whitespace-pre-wrap pl-1">{line.text}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-slate-950/20 flex items-center justify-end gap-3 shrink-0">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-5 py-2.5 text-xs font-bold text-white bg-[#0067B1] hover:bg-[#005797] rounded-xl shadow-lg shadow-[#0067B1]/20 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                            >
                                <Check className="w-4 h-4" />
                                Confirm & Deploy
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(var(--m3-on-surface-rgb), 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(var(--m3-on-surface-rgb), 0.2);
                }

                .token.property { color: var(--m3-primary); font-weight: bold; }
                .token.string { color: #43a047; }
                .token.number { color: #fb8c00; }
                .token.boolean { color: #d81b60; font-weight: bold; }
                .token.null { color: #757575; italic: true; }
                .token.operator { color: var(--m3-on-surface-variant); }
                .token.punctuation { color: var(--m3-on-surface-variant); opacity: 0.7 }
            `}</style>
        </div>
    );
};