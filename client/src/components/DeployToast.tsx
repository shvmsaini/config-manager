import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { cn } from '../utils/cn';

interface DeployToastProps {
    result: { success: boolean; message: string } | null;
    onDismiss: () => void;
}

export const DeployToast: React.FC<DeployToastProps> = ({ result, onDismiss }) => {
    if (!result) return null;

    return (
        <div className={cn(
            "fixed bottom-8 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-10 z-50 flex items-center gap-5 px-8 py-5 rounded-2xl shadow-m3-3 animate-in slide-in-from-right-10 fade-in duration-500 border-[3px] border-m3-outline",
            result.success ? "bg-m3-surface text-m3-on-surface border-l-8 border-m3-primary" : "bg-m3-error-container text-m3-on-error-container border-l-8 border-m3-error"
        )}>
            <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-inner",
                result.success ? "bg-m3-primary/20 text-m3-primary" : "bg-m3-error/20 text-m3-error"
            )}>
                {result.success ? <CheckCircle2 className="w-7 h-7" /> : <AlertCircle className="w-7 h-7" />}
            </div>
            <div className="flex flex-col">
                <span className="font-bold text-base uppercase tracking-tight">{result.success ? 'Action Successful' : 'Action Failed'}</span>
                <span className="text-sm font-bold opacity-80">{result.message}</span>
            </div>
            <button onClick={onDismiss} className="ml-4 p-2 hover:bg-m3-on-surface/10 rounded-full transition-all">
                <X className="w-5 h-5" />
            </button>
        </div>
    );
};
