import React from 'react';
import { WORKFLOWS } from '../constants';

interface ProConfig {
  lens: string;
  angle: string;
  lighting: string;
}

interface AgentsPanelProps {
  selectedWorkflow: string;
  onSelectWorkflow: (id: string) => void;
  visualDirectorConfig: { hdr: boolean; bitDepth16: boolean };
  onConfigChange: (key: string, value: boolean) => void;
  batchMode: boolean;
  onBatchModeChange: (enabled: boolean) => void;
  // New props for Pro Controls
  proConfig: ProConfig;
  onProConfigChange: (key: keyof ProConfig, value: string) => void;
}

const AgentsPanel: React.FC<AgentsPanelProps> = ({ 
  selectedWorkflow, 
  onSelectWorkflow,
  visualDirectorConfig,
  onConfigChange,
  batchMode,
  onBatchModeChange,
  proConfig,
  onProConfigChange
}) => {
  return (
    <div className="h-full flex flex-col gap-5">
      
      {/* Visual Director Agent (Standard) */}
      <div className="border border-indigo-900/50 bg-indigo-950/20 p-4 rounded-lg shadow-sm">
        <h2 className="text-indigo-400 font-bold text-sm uppercase tracking-wider mb-1 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            Visual Director
        </h2>
        <p className="text-zinc-500 text-xs mb-3">Enforcing production standards.</p>
        
        <div className="space-y-2">
            <label className="flex items-center justify-between text-sm text-zinc-300 cursor-pointer hover:text-white transition-colors">
                <span>Force HDR Lighting</span>
                <input 
                    type="checkbox" 
                    checked={visualDirectorConfig.hdr}
                    onChange={(e) => onConfigChange('hdr', e.target.checked)}
                    className="accent-indigo-500"
                />
            </label>
            <label className="flex items-center justify-between text-sm text-zinc-300 cursor-pointer hover:text-white transition-colors">
                <span>16-bit Color Depth</span>
                <input 
                    type="checkbox" 
                    checked={visualDirectorConfig.bitDepth16}
                    onChange={(e) => onConfigChange('bitDepth16', e.target.checked)}
                    className="accent-indigo-500"
                />
            </label>
        </div>
      </div>

      {/* Pro Control Matrix (Best Controllability Feature) */}
      <div className="border border-pink-900/40 bg-pink-950/10 p-3 rounded-lg shadow-sm">
         <h2 className="text-pink-400 font-bold text-[11px] uppercase tracking-wider mb-2 flex items-center justify-between">
            <span className="flex items-center gap-2">
                 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                 Pro Control Matrix
            </span>
            <span className="text-[9px] bg-pink-900/30 text-pink-300 px-1.5 py-0.5 rounded border border-pink-800/50">LOCKED</span>
        </h2>
        
        <div className="space-y-3">
             {/* Lens Control */}
             <div>
                <label className="text-[10px] text-zinc-500 font-bold mb-1 block">LENS / FOV</label>
                <div className="grid grid-cols-4 gap-1">
                    {['16mm', '35mm', '50mm', '85mm'].map(opt => (
                        <button
                            key={opt}
                            onClick={() => onProConfigChange('lens', proConfig.lens === opt ? 'Default' : opt)}
                            className={`text-[9px] py-1 rounded border transition-all ${proConfig.lens === opt ? 'bg-pink-600 text-white border-pink-500' : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700'}`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
             </div>

             {/* Angle Control */}
             <div>
                <label className="text-[10px] text-zinc-500 font-bold mb-1 block">CAMERA ANGLE</label>
                <div className="grid grid-cols-3 gap-1">
                    {['Low Angle', 'Eye Level', 'High Angle'].map(opt => (
                        <button
                            key={opt}
                            onClick={() => onProConfigChange('angle', proConfig.angle === opt ? 'Default' : opt)}
                            className={`text-[9px] py-1 rounded border transition-all ${proConfig.angle === opt ? 'bg-pink-600 text-white border-pink-500' : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700'}`}
                        >
                            {opt.split(' ')[0]}
                        </button>
                    ))}
                </div>
             </div>

             {/* Lighting Style */}
             <div>
                <label className="text-[10px] text-zinc-500 font-bold mb-1 block">LIGHTING / STYLE</label>
                 <div className="grid grid-cols-3 gap-1">
                    {['Cinematic', 'Natural', 'Studio'].map(opt => (
                        <button
                            key={opt}
                            onClick={() => onProConfigChange('lighting', proConfig.lighting === opt ? 'Default' : opt)}
                            className={`text-[9px] py-1 rounded border transition-all ${proConfig.lighting === opt ? 'bg-pink-600 text-white border-pink-500' : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700'}`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
             </div>
        </div>
      </div>

      {/* Batch Automation Agent */}
      <div className={`border p-4 rounded-lg transition-all duration-300 shadow-sm ${batchMode ? 'border-emerald-900/50 bg-emerald-950/20' : 'border-zinc-800 bg-zinc-900/20'}`}>
        <h2 className={`font-bold text-sm uppercase tracking-wider mb-1 flex items-center gap-2 ${batchMode ? 'text-emerald-400' : 'text-zinc-500'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            Batch Agent
        </h2>
        <p className="text-zinc-500 text-xs mb-3">Parallel generation variants.</p>
        
        <label className="flex items-center justify-between text-sm text-zinc-300 cursor-pointer hover:text-white transition-colors">
            <span>Generate Variants (x4)</span>
            <div 
                className={`w-10 h-5 rounded-full relative transition-colors ${batchMode ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                onClick={() => onBatchModeChange(!batchMode)}
            >
                <div className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-transform ${batchMode ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </div>
        </label>
      </div>

      {/* Workflows */}
      <div className="flex-1 overflow-y-auto">
        <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-3">Workflows</h3>
        <div className="space-y-2">
          {WORKFLOWS.map((wf) => (
            <button
              key={wf.id}
              onClick={() => onSelectWorkflow(wf.id)}
              className={`w-full text-left p-3 rounded-md border transition-all duration-200 flex items-start gap-3 group ${
                selectedWorkflow === wf.id
                  ? 'bg-zinc-800 border-zinc-600 text-white shadow-lg'
                  : 'bg-transparent border-transparent hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span className="text-xl group-hover:scale-110 transition-transform">{wf.icon}</span>
              <div>
                <div className="font-medium text-sm">{wf.name}</div>
                <div className="text-xs text-zinc-500 mt-0.5">{wf.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Pipeline Integrations - Confirmation Section */}
      <div className="mt-auto pt-4 pb-2">
        <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3 border-b border-zinc-800 pb-2">Pipeline Integrations</h3>
        <div className="space-y-2 text-xs font-mono text-zinc-400">
            <div className="flex items-center justify-between group hover:bg-zinc-900/50 p-1 rounded transition-colors">
                <span className="flex items-center gap-2 text-zinc-300">
                    <span className="text-green-500 text-sm">✅</span> FIBO Logic Core
                </span>
                <span className="text-[9px] bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 rounded text-zinc-500">v3.0</span>
            </div>
            <div className="flex items-center justify-between group hover:bg-zinc-900/50 p-1 rounded transition-colors">
                 <span className="flex items-center gap-2 text-zinc-300">
                    <span className="text-green-500 text-sm">✅</span> Bria Neural API
                </span>
                 <span className="text-[9px] bg-indigo-900/30 border border-indigo-800/50 px-1.5 py-0.5 rounded text-indigo-400">REST</span>
            </div>
             <div className="flex items-center justify-between group hover:bg-zinc-900/50 p-1 rounded transition-colors">
                 <span className="flex items-center gap-2 text-zinc-300">
                    <span className="text-green-500 text-sm">✅</span> MCP Protocol
                </span>
                 <span className="text-[9px] bg-purple-900/30 border border-purple-800/50 px-1.5 py-0.5 rounded text-purple-400">JSON-RPC</span>
            </div>
             <div className="flex items-center justify-between group hover:bg-zinc-900/50 p-1 rounded transition-colors">
                 <span className="flex items-center gap-2 text-zinc-300">
                    <span className="text-green-500 text-sm">✅</span> ComfyUI Bridge
                </span>
                 <span className="text-[9px] bg-emerald-900/30 border border-emerald-800/50 px-1.5 py-0.5 rounded text-emerald-400">WSS</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AgentsPanel;