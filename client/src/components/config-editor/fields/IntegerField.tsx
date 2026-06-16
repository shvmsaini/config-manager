import React, { useRef } from 'react';

interface IntegerFieldProps {
    value: number;
    onChange: (value: number) => void;
}

export const IntegerField: React.FC<IntegerFieldProps> = ({ value, onChange }) => {
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const startChanging = (delta: number) => {
        const change = () => {
            const current = Number(value || 0);
            onChange(Math.max(0, current + delta));
        };
        change();
        intervalRef.current = setInterval(change, 120);
    };

    const stopChanging = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onMouseDown={() => startChanging(-1)}
                onMouseUp={stopChanging}
                onMouseLeave={stopChanging}
                onTouchStart={() => startChanging(-1)}
                onTouchEnd={stopChanging}
                className="px-2 py-1 rounded bg-m3-surface-variant hover:bg-m3-primary/10 text-m3-on-surface font-mono"
            >
                -
            </button>

            <input
                type="number"
                value={value ?? 0}
                onChange={(e) => {
                    const intVal = parseInt(e.target.value, 10);
                    if (!isNaN(intVal)) onChange(intVal);
                }}
                className="w-16 text-center bg-transparent border-[3px] border-m3-outline rounded px-2 py-1 text-sm font-mono focus:ring-1 focus:ring-m3-primary appearance-none"
                style={{ MozAppearance: 'textfield' }}
            />

            <button
                onMouseDown={() => startChanging(1)}
                onMouseUp={stopChanging}
                onMouseLeave={stopChanging}
                onTouchStart={() => startChanging(1)}
                onTouchEnd={stopChanging}
                className="px-2 py-1 rounded bg-m3-surface-variant hover:bg-m3-primary/10 text-m3-on-surface font-mono"
            >
                +
            </button>
        </div>
    );
};
