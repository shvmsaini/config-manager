import React from 'react';
import { cn } from '../../../utils/cn';

interface BooleanFieldProps {
    value: boolean;
    onChange: (value: boolean) => void;
    compact?: boolean;
}

export const BooleanField: React.FC<BooleanFieldProps> = ({ value, onChange, compact }) => (
    <button
        onClick={() => onChange(!value)}
        className={cn(
            "flex items-center justify-center w-full sm:w-auto gap-3 rounded-full transition-all border",
            value
                ? "bg-m3-primary-container border-m3-primary text-m3-on-primary-container"
                : "bg-transparent border-m3-outline text-m3-on-surface-variant",
            compact ? "py-0.5 px-2 h-6" : "py-1 px-3"
        )}
    >
        <span className={cn(compact ? "text-xs" : "text-sm font-medium", value ? "font-bold" : "")}>
            {value ? 'On' : 'Off'}
        </span>
        <div className={cn(
            "rounded-full border border-current",
            value ? "bg-current" : "bg-transparent",
            compact ? "w-3 h-3" : "w-4 h-4"
        )} />
    </button>
);
