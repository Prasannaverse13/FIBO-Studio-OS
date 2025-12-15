import React, { useState } from 'react';
import { BLUEPRINT_LIBRARY } from '../constants';
import { LibraryBlueprint } from '../types';

interface LibraryPanelProps {
    onLoadBlueprint: (blueprint: LibraryBlueprint) => void;
}

const LibraryPanel: React.FC<LibraryPanelProps> = ({ onLoadBlueprint }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    const categories = ['All', ...Array.from(new Set(BLUEPRINT_LIBRARY.map(b => b.category)))];

    const filteredBlueprints = BLUEPRINT_LIBRARY.filter(bp => {
        const matchesSearch = bp.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              bp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              bp.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = selectedCategory === 'All' || bp.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="h-full flex flex-col gap-4">
            {/* Search and Filter */}
            <div className="space-y-3">
                <input 
                    type="text" 
                    placeholder="Search library..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 placeholder-zinc-600"
                />
                <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-2.5 py-1 rounded text-[10px] font-medium whitespace-nowrap transition-colors border ${
                                selectedCategory === cat 
                                ? 'bg-indigo-600 text-white border-indigo-500' 
                                : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                {filteredBlueprints.length === 0 ? (
                    <div className="text-center py-8 text-zinc-600 text-xs italic">
                        No blueprints found.
                    </div>
                ) : (
                    filteredBlueprints.map((bp) => (
                        <div 
                            key={bp.id} 
                            className="group border border-zinc-800 bg-zinc-900/30 p-3 rounded-lg hover:border-indigo-500/50 hover:bg-zinc-800/50 transition-all cursor-pointer relative"
                            onClick={() => onLoadBlueprint(bp)}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">{bp.category}</span>
                                <span className="text-[10px] text-zinc-600 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 group-hover:border-indigo-500/30 transition-colors">JSON v3</span>
                            </div>
                            <h3 className="text-sm font-bold text-zinc-200 mb-1 group-hover:text-white">{bp.title}</h3>
                            <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed mb-3">
                                {bp.description}
                            </p>
                            
                            {/* Tags */}
                            <div className="flex flex-wrap gap-1 mb-3">
                                {bp.tags.slice(0, 3).map(tag => (
                                    <span key={tag} className="text-[9px] text-zinc-500 bg-zinc-900/80 px-1 py-0.5 rounded">#{tag}</span>
                                ))}
                            </div>

                            <button className="w-full py-1.5 bg-zinc-800 hover:bg-indigo-600 text-zinc-300 hover:text-white text-xs font-medium rounded transition-colors flex items-center justify-center gap-2">
                                <span>Load Blueprint</span>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            </button>
                        </div>
                    ))
                )}
            </div>
            
            <div className="pt-2 border-t border-zinc-800">
                <p className="text-[10px] text-zinc-600 text-center">
                    Library updated weekly with enterprise presets.
                </p>
            </div>
        </div>
    );
};

export default LibraryPanel;