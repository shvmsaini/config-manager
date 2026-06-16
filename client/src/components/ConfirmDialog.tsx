import React, { useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    title?: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    title = 'Confirm Action',
    message,
    onConfirm,
    onCancel,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
}) => {
    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onCancel();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Dialog */}
            <div className="relative bg-m3-surface rounded-3xl shadow-m3-5 border-[3px] border-m3-outline max-w-md w-full animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="flex items-start justify-between p-6 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-m3-error/10 flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-m3-error" />
                        </div>
                        <h2 className="text-xl font-bold text-m3-on-surface">{title}</h2>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-m3-on-surface/10 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-m3-on-surface-variant" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 pb-6">
                    <p className="text-m3-on-surface-variant text-base leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 p-6 pt-0">
                    <button
                        onClick={onCancel}
                        className="px-6 py-2.5 rounded-full bg-m3-surface-variant/50 hover:bg-m3-surface-variant text-m3-on-surface font-bold text-sm transition-all"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onCancel(); // Close the dialog after confirming
                        }}
                        className="px-6 py-2.5 rounded-full bg-m3-error hover:bg-m3-error/90 text-white font-bold text-sm transition-all shadow-m3-2 hover:shadow-m3-3"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};
