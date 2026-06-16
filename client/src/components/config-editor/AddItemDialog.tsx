import React, { useState } from 'react';
import { Folder, List, Type, Eye } from 'lucide-react';
import { cn } from '../../utils/cn';

interface AddItemDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (keyName: string, addType: 'object' | 'array' | 'keyValue', selectedParent: string) => void;
    activeTab?: string;
    path: string[];
    isArray: boolean;
    values: any;
}

export const AddItemDialog: React.FC<AddItemDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    activeTab,
    path,
    isArray,
}) => {
    const [addType, setAddType] = useState<'object' | 'array' | 'keyValue'>('keyValue');
    const [newKeyName, setNewKeyName] = useState('');
    const [selectedParent, setSelectedParent] = useState('bannerCarousel');

    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm(newKeyName, addType, selectedParent);
        setNewKeyName('');
    };

    const isWidgetAdd = activeTab === 'widgets.json' && path.length === 0;
    const isPageAdd = activeTab === 'pages.json' && path.length === 0;

    return (
        <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
            onMouseDown={e => e.stopPropagation()}
            onDragStart={e => e.stopPropagation()}
        >
            <div className="bg-m3-surface rounded-2xl shadow-2xl w-[480px] p-8 animate-in fade-in zoom-in-95 border border-white/10">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-m3-on-surface">
                        {isPageAdd ? 'Add New Page' :
                            isWidgetAdd ? 'Register New Widget' : 'Add New Item'}
                    </h2>
                    <p className="text-sm text-m3-on-surface-variant mt-1">
                        {isPageAdd
                            ? 'Enter the name for your new page. It will be initialized with a widgets collection.' :
                            isWidgetAdd
                                ? 'Define a new custom widget by extending an existing system component.'
                                : 'Choose the type of configuration item you want to add.'}
                    </p>
                </div>

                {isWidgetAdd ? (
                    <div className="space-y-6 mb-6">
                        <div className="bg-m3-surface-variant/30 p-4 rounded-xl border border-m3-outline/50">
                            <label className="block text-xs font-bold text-m3-on-surface mb-2 uppercase tracking-wider">Widget Name (ID)</label>
                            <input
                                type="text"
                                value={newKeyName}
                                onChange={(e) => setNewKeyName(e.target.value)}
                                className="w-full border-[3px] border-m3-outline rounded-lg px-4 py-2.5 bg-m3-surface focus:border-m3-primary focus:ring-0 outline-none transition-colors font-mono text-sm placeholder:text-m3-on-surface-variant/40"
                                placeholder="e.g., custom_promo_banner"
                                autoFocus
                            />
                        </div>

                        <div className="bg-m3-surface-variant/30 p-4 rounded-xl border border-m3-outline/50">
                            <label className="block text-xs font-bold text-m3-on-surface mb-2 uppercase tracking-wider">Extends From (Type)</label>
                            <select
                                value={selectedParent}
                                onChange={(e) => setSelectedParent(e.target.value)}
                                className="w-full border-[3px] border-m3-outline rounded-lg px-4 py-2.5 bg-m3-surface focus:border-m3-primary focus:ring-0 outline-none transition-colors text-sm"
                            >
                                <option value="bannerCarousel">bannerCarousel</option>
                                <option value="horizontal_list">horizontal_list</option>
                                <option value="vertical_list">vertical_list</option>
                                <option value="grid">grid</option>
                                <option value="mediaList">mediaList</option>
                                <option value="header">header</option>
                                <option value="flightStatus">flightStatus</option>
                                <option value="dpad">dpad</option>
                                <option value="seatPairing">seatPairing</option>
                                <option value="mediaCard">mediaCard</option>
                                <option value="weatherWidget">weatherWidget</option>
                                <option value="shimmer">shimmer</option>
                                <option value="error">error</option>
                                <option value="paperFoldLoader">paperFoldLoader</option>
                                <option value="connectivity">connectivity</option>
                                <option value="myList">myList</option>
                                <option value="searchScreen">searchScreen</option>
                                <option value="profile">profile</option>
                            </select>
                            <p className="text-[10px] text-m3-on-surface-variant mt-2 italic">The new widget will inherit all properties from this base component.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3 mb-6">
                        <button
                            onClick={() => setAddType('object')}
                            className={cn(
                                "flex items-start gap-4 p-4 rounded-xl border-[3px] transition-all text-left group/btn",
                                addType === 'object'
                                    ? "border-m3-primary bg-m3-primary/5"
                                    : "border-m3-outline hover:border-m3-primary/40 hover:bg-m3-surface-variant/30"
                            )}
                        >
                            <div className={cn("p-2.5 rounded-lg shrink-0 transition-colors", addType === 'object' ? "bg-m3-primary text-white" : "bg-m3-surface-variant text-m3-on-surface-variant group-hover/btn:text-m3-primary")}>
                                <Folder className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className={cn("font-bold text-sm", addType === 'object' ? "text-m3-primary" : "text-m3-on-surface")}>Section Group</h3>
                                <p className="text-xs text-m3-on-surface-variant mt-1 leading-relaxed">A container that holds multiple related settings and properties inside it.</p>
                            </div>
                        </button>

                        {path.length > 0 && (
                            <>
                                <button
                                    onClick={() => setAddType('array')}
                                    className={cn(
                                        "flex items-start gap-4 p-4 rounded-xl border-[3px] transition-all text-left group/btn",
                                        addType === 'array'
                                            ? "border-m3-primary bg-m3-primary/5"
                                            : "border-m3-outline hover:border-m3-primary/40 hover:bg-m3-surface-variant/30"
                                    )}
                                >
                                    <div className={cn("p-2.5 rounded-lg shrink-0 transition-colors", addType === 'array' ? "bg-m3-primary text-white" : "bg-m3-surface-variant text-m3-on-surface-variant group-hover/btn:text-m3-primary")}>
                                        <List className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className={cn("font-bold text-sm", addType === 'array' ? "text-m3-primary" : "text-m3-on-surface")}>List Collection</h3>
                                        <p className="text-xs text-m3-on-surface-variant mt-1 leading-relaxed">A sequence of items you can reorder. Useful for menus or carousel slides.</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setAddType('keyValue')}
                                    className={cn(
                                        "flex items-start gap-4 p-4 rounded-xl border-[3px] transition-all text-left group/btn",
                                        addType === 'keyValue'
                                            ? "border-m3-primary bg-m3-primary/5"
                                            : "border-m3-outline hover:border-m3-primary/40 hover:bg-m3-surface-variant/30"
                                    )}
                                >
                                    <div className={cn("p-2.5 rounded-lg shrink-0 transition-colors", addType === 'keyValue' ? "bg-m3-primary text-white" : "bg-m3-surface-variant text-m3-on-surface-variant group-hover/btn:text-m3-primary")}>
                                        <Type className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className={cn("font-bold text-sm", addType === 'keyValue' ? "text-m3-primary" : "text-m3-on-surface")}>Single Property</h3>
                                        <p className="text-xs text-m3-on-surface-variant mt-1 leading-relaxed">A basic value like a text field, number, true/false switch, or color picker.</p>
                                    </div>
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* JSON Preview */}
                <div className="mb-6 p-4 bg-m3-surface-variant/20 rounded-xl border-2 border-m3-outline/30 overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-m3-on-surface-variant text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                            <Eye className="w-3.5 h-3.5" /> Resulting JSON Preview
                        </div>
                    </div>
                    <pre className="text-emerald-600 font-mono text-[11px] overflow-x-auto whitespace-pre">
                        {JSON.stringify(
                            {
                                [newKeyName || (isPageAdd ? 'newPageName' : 'new_key')]:
                                    isPageAdd ? { widgets: [] } :
                                        addType === 'object' ? (path.length === 0 ? { type: "" } : {}) :
                                            addType === 'array' ? [] : ""
                            },
                            null, 2
                        )}
                    </pre>
                </div>

                {/* Key Name Input (not for arrays or widget top-level) */}
                {(!isArray && !isWidgetAdd) && (
                    <div className="mb-6 bg-m3-surface-variant/30 p-4 rounded-xl border border-m3-outline/50">
                        <label className="block text-xs font-bold text-m3-on-surface mb-2 uppercase tracking-wider">
                            {isPageAdd ? 'Page Name' : 'Property Identifier'}
                        </label>
                        <input
                            type="text"
                            value={newKeyName}
                            onChange={(e) => setNewKeyName(e.target.value)}
                            className="w-full border-[3px] border-m3-outline rounded-lg px-4 py-2.5 bg-m3-surface focus:border-m3-primary focus:ring-0 outline-none transition-colors font-mono text-sm placeholder:text-m3-on-surface-variant/40"
                            placeholder={isPageAdd ? "e.g., homePage or details" : "e.g., bannerTitle or isVisible"}
                            autoFocus
                        />
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest bg-m3-surface-variant text-m3-on-surface-variant hover:bg-m3-surface-variant/70 hover:text-m3-on-surface transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className={cn(
                            "px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all shadow-m3-2",
                            !isArray && !newKeyName.trim()
                                ? "bg-m3-surface-variant/50 text-m3-on-surface-variant/50 cursor-not-allowed"
                                : "bg-m3-primary text-m3-on-primary hover:bg-m3-primary/90 hover:-translate-y-0.5 hover:shadow-m3-3 active:translate-y-0 active:shadow-m3-1"
                        )}
                        disabled={!isArray && !newKeyName.trim()}
                    >
                        Create Item
                    </button>
                </div>
            </div>
        </div>
    );
};
