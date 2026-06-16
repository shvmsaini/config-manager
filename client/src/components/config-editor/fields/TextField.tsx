import React from 'react';
import { cn } from '../../../utils/cn';

interface TextFieldProps {
    value: string;
    onChange: (value: string) => void;
    compact?: boolean;
    placeholder?: string;
    isImage?: boolean;
    isComponentField?: boolean;
    onFocus?: () => void;
}

export const TextField: React.FC<TextFieldProps> = ({
    value,
    onChange,
    compact,
    placeholder = 'Enter value...',
    isImage,
    isComponentField,
    onFocus,
}) => (
    <input
        type="text"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => isComponentField && onFocus?.()}
        className={cn(
            "w-full bg-transparent border-none p-0 text-m3-on-surface placeholder:text-m3-on-surface-variant/50 focus:ring-0 text-Base font-mono",
            isImage ? "pr-12" : "",
            compact ? "text-xs h-5" : "text-sm"
        )}
        placeholder={placeholder}
    />
);
