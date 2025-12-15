import React from 'react';
import { HistoryItem, FiboScene } from '../types';

interface VersionHistoryProps {
    history: HistoryItem[];
    onRestore: (scene: FiboScene) => void;
    onClose: () => void;
}

const VersionHistory: React.FC<VersionHistoryProps> = ({ history, onRestore, onClose }) => {
    // Reverse history to show newest first
    const reversedHistory = [...history].reverse();

    return (
        <div className="absolute inset-0 bg-[#09090b] z-20 flex flex-col animate-fade-in">
            {/* Header */}
            <div className="h-10 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-900/20 shrink-0">
                <h2 className="text-zinc-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Version Timeline
                </h2>
                <button 
                    onClick={onClose}
                    className="text-zinc-500 hover:text-white transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            {/* Timeline Content */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {reversedHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-600 space-y-2">
                         <svg className="w-8 h-8 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <p className="text-xs">No history recorded yet.</p>
                        <p className="text-[10px]">Generate images to create snapshots.</p>
                    </div>
                ) : (
                    <div className="relative border-l border-zinc-800 ml-3 space-y-6">
                        {reversedHistory.map((item, idx) => (
                            <div key={item.id} className="relative pl-6 group">
                                {/* Dot */}
                                <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-[#09090b] transition-colors ${idx === 0 ? 'bg-indigo-500' : 'bg-zinc-700 group-hover:bg-zinc-500'}`}></div>
                                
                                {/* Card */}
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center justify-between">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${idx === 0 ? 'text-indigo-400' : 'text-zinc-500'}`}>
                                            {item.type}
                                        </span>
                                        <span className="text-[10px] font-mono text-zinc-600">
                                            {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                                        </span>
                                    </div>
                                    
                                    <div className="bg-zinc-900/40 border border-zinc-800 rounded p-2 hover:border-zinc-600 transition-colors">
                                        <p className="text-xs text-zinc-300 line-clamp-2 mb-2 italic">
                                            "{item.scene.short_description}"
                                        </p>
                                        <div className="flex items-center justify-between mt-2">
                                             <div className="flex gap-1">
                                                 {item.scene.objects.length > 0 && (
                                                     <span className="text-[9px] bg-zinc-800 text-zinc-500 px-1 rounded">{item.scene.objects.length} objs</span>
                                                 )}
                                                 <span className="text-[9px] bg-zinc-800 text-zinc-500 px-1 rounded">{item.scene.aspect_ratio || '1:1'}</span>
                                             </div>
                                             <button 
                                                onClick={() => {
                                                    onRestore(item.scene);
                                                    onClose();
                                                }}
                                                className="text-[10px] bg-indigo-900/30 text-indigo-400 border border-indigo-800/50 hover:bg-indigo-600 hover:text-white px-2 py-0.5 rounded transition-colors"
                                             >
                                                Restore
                                             </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VersionHistory;