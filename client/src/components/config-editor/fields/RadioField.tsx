import React from 'react';
import { cn } from '../../../utils/cn';

interface RadioFieldProps {
    value: string;
    options: string[];
    onChange: (value: string) => void;
    path: string[];
    disabled?: boolean;
    disabledMessage?: string;
}

export const RadioField: React.FC<RadioFieldProps> = ({
    value,
    options,
    onChange,
    path,
    disabled = false,
    disabledMessage,
}) => (
    <div className="flex gap-4 items-center">
        {options.map(option => (
            <label
                key={option}
                className={cn(
                    "flex items-center gap-2 text-sm font-mono",
                    disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                )}
            >
                <input
                    type="radio"
                    name={path.join('-')}
                    value={option}
                    checked={value === option}
                    onChange={() => !disabled && onChange(option)}
                    className="accent-m3-primary"
                    disabled={disabled}
                />
                {option}
            </label>
        ))}
        {disabled && disabledMessage && (
            <span className="text-[10px] text-m3-error italic ml-2">{disabledMessage}</span>
        )}
    </div>
);
