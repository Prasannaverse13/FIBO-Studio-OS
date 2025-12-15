import React, { useState, useEffect } from 'react';
import { generateFiboJson, generateBatchFiboJson } from './services/geminiService';
import { generateImageFromFibo, FiboGenerationResponse } from './services/fiboService';
import { FiboScene, LibraryBlueprint, HistoryItem } from './types';
import { WORKFLOWS } from './constants';
import JsonViewer from './components/JsonViewer';
import AgentsPanel from './components/AgentsPanel';
import LandingPage from './components/LandingPage';
import LibraryPanel from './components/LibraryPanel';
import VersionHistory from './components/VersionHistory';

// Pro Control Types
export interface ProConfig {
  lens: string;
  angle: string;
  lighting: string;
}

interface ImageCardProps {
  result: FiboGenerationResponse | null;
  index: number;
  isSelected: boolean;
  onClick: () => void;
}

// Sub-component for individual Image Result with internal loading state
const ImageCard: React.FC<ImageCardProps> = ({ result, index, isSelected, onClick }) => {
    const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

    useEffect(() => {
        if (!result) {
            setStatus('loading');
        } else {
            setStatus('loading'); // Reset to loading when result changes
            
            if (result.source === 'ERROR') {
                setStatus('error');
                return;
            }

            // Preload image to avoid flicker
            const img = new Image();
            img.src = result.url;
            img.onload = () => setStatus('loaded');
            img.onerror = () => setStatus('error');
        }
    }, [result]);

    if (!result) {
         return (
            <div className="relative aspect-square rounded-lg border-2 border-zinc-800/50 bg-zinc-900/20 flex flex-col items-center justify-center space-y-2">
                <div className="w-6 h-6 border-2 border-indigo-500/50 border-t-indigo-500 rounded-full animate-spin"></div>
                <span className="text-[10px] text-zinc-600 animate-pulse">Rendering...</span>
            </div>
         );
    }

    return (
        <div 
            onClick={onClick}
            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer hover:scale-[1.02] ${isSelected ? 'border-emerald-500 shadow-emerald-900/20 shadow-lg' : 'border-zinc-800 hover:border-zinc-600'}`}
        >
            {status === 'loading' && (
               <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center z-10">
                   <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
               </div>
            )}
            {status === 'error' && (
                <div className="absolute inset-0 bg-zinc-900 flex flex-col items-center justify-center z-10 text-red-500 text-xs p-2 text-center">
                    <span className="mb-1">⚠ Generation Failed</span>
                    <span className="text-[9px] text-zinc-500">API connection timed out</span>
                </div>
            )}
            {status === 'loaded' && (
                <img 
                    src={result.url} 
                    className={`w-full h-full object-cover transition-opacity duration-500`} 
                    alt={`Variant ${index + 1}`} 
                />
            )}
            <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-sm z-20">
                Var {index + 1}
            </div>
        </div>
    );
};

function App() {
  // Navigation State
  const [showLanding, setShowLanding] = useState<boolean>(true);
  const [sidebarTab, setSidebarTab] = useState<'studio' | 'library'>('studio');
  const [showHistory, setShowHistory] = useState<boolean>(false);

  // App State
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>(WORKFLOWS[0].id);
  const [prompt, setPrompt] = useState<string>("");
  
  // Agent Config
  const [visualDirectorConfig, setVisualDirectorConfig] = useState({ hdr: true, bitDepth16: true });
  
  // New: Pro Control Matrix State
  const [proConfig, setProConfig] = useState<ProConfig>({
    lens: 'Default',
    angle: 'Default',
    lighting: 'Default'
  });

  const [batchMode, setBatchMode] = useState<boolean>(false);
  
  // Operation State
  const [isInterpreting, setIsInterpreting] = useState<boolean>(false);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Data
  const [fiboScenes, setFiboScenes] = useState<FiboScene[]>([]);
  // Changed to allow nulls for loading slots
  const [generatedResults, setGeneratedResults] = useState<(FiboGenerationResponse | null)[]>([]);
  const [selectedResultIndex, setSelectedResultIndex] = useState<number>(0);

  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Computed
  const currentWorkflow = WORKFLOWS.find(w => w.id === selectedWorkflowId) || WORKFLOWS[0];
  const currentJson = fiboScenes.length > 0 ? fiboScenes[selectedResultIndex] : null;

  useEffect(() => {
    // Optional: Reset prompt on workflow change
  }, [selectedWorkflowId]);

  const addToHistory = (scene: FiboScene, type: HistoryItem['type']) => {
      const newItem: HistoryItem = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          scene: JSON.parse(JSON.stringify(scene)), // Deep copy
          type: type
      };
      setHistory(prev => [...prev, newItem]);
  };

  const handleReset = () => {
    setFiboScenes([]);
    setGeneratedResults([]);
    setPrompt("");
  };

  const handleLogout = () => {
    handleReset();
    setShowLanding(true);
  };

  const handleJsonUpdate = (newData: FiboScene) => {
      // Allow users to edit the JSON manually. 
      // We update the fiboScenes array at the current index.
      const newScenes = [...fiboScenes];
      if (newScenes.length === 0) {
          newScenes.push(newData);
      } else {
          newScenes[selectedResultIndex] = newData;
      }
      setFiboScenes(newScenes);
      // Optional: Add to history on manual update? 
      // Maybe not every keystroke, but we could add a "Save Snapshot" button later.
  };

  const handleLoadBlueprint = (blueprint: LibraryBlueprint) => {
      // Load blueprint into the editor
      setFiboScenes([blueprint.scene]);
      setGeneratedResults([]); // Clear previous images
      setSelectedResultIndex(0);
      setPrompt(`[Based on] ${blueprint.title}: ${blueprint.description}`);
      addToHistory(blueprint.scene, 'Library');
      // Switch back to studio tab to see result
      setSidebarTab('studio');
  };

  const handleRestoreHistory = (scene: FiboScene) => {
      setFiboScenes([scene]);
      setGeneratedResults([]); // Clear images as they might not match
      setSelectedResultIndex(0);
      // We don't change prompt to preserve context or maybe we should?
      // Let's leave prompt as is so user knows they are editing.
  };

  const handleExport = async () => {
      const currentResult = generatedResults[selectedResultIndex];
      if (!currentResult || currentResult.source === 'ERROR') return;

      try {
          // Attempt to fetch blob for proper download
          const response = await fetch(currentResult.url);
          const blob = await response.blob();
          const blobUrl = window.URL.createObjectURL(blob);
          
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = `FIBO_Studio_Asset_${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);
      } catch (e) {
          // Fallback if fetch fails (e.g. CORS)
          console.warn("Direct download failed, opening in new tab", e);
          window.open(currentResult.url, '_blank');
      }
  };

  const handleGenerate = async () => {
    // If prompt is empty but we have scenes, treat as a "Re-render" request from JSON edits
    if (!prompt.trim() && fiboScenes.length === 0) return;
    
    setIsInterpreting(true);
    setError(null);
    
    // Determine mode: Fresh Gen, Refinement, or Re-render from JSON edit
    const isReRender = fiboScenes.length > 0 && !prompt.trim(); // User edited JSON and clicked button
    const isRefinement = fiboScenes.length > 0 && !!prompt.trim() && !batchMode;
    
    if (!isRefinement && !isReRender) {
        setFiboScenes([]);
        setGeneratedResults([]);
        setSelectedResultIndex(0);
    }
    
    try {
      let scenes: FiboScene[] = [];

      if (isReRender) {
          // Skip Gemini, just use current JSON
          scenes = fiboScenes;
          setIsInterpreting(false);
          addToHistory(scenes[0], 'Manual'); // Treat re-render of manual edit as history point
      } else {
          // Build constraints including Pro Controls
          const constraints = [
            visualDirectorConfig.hdr ? "Ensure lighting settings support High Dynamic Range (HDR) look." : "",
            visualDirectorConfig.bitDepth16 ? "Color palette should be rich and support 16-bit depth feel." : "",
            proConfig.lens !== 'Default' ? `STRICT CONSTRAINT: Camera Lens must be ${proConfig.lens}.` : "",
            proConfig.angle !== 'Default' ? `STRICT CONSTRAINT: Camera Angle must be ${proConfig.angle}.` : "",
            proConfig.lighting !== 'Default' ? `STRICT CONSTRAINT: Lighting Style must be ${proConfig.lighting}.` : "",
            `Workflow context: ${currentWorkflow.name}`
          ].filter(Boolean).join(" ");

          if (batchMode) {
            // FORCE 4 VARIANTS
            scenes = await generateBatchFiboJson(prompt, 4, constraints);
            setFiboScenes(scenes);
            // Add first variant to history for reference
            addToHistory(scenes[0], 'Batch');
          } else {
            const previousJson = isRefinement ? currentJson : undefined;
            const json = await generateFiboJson(prompt, constraints, previousJson || undefined);
            scenes = [json];
            setFiboScenes(scenes);
            addToHistory(json, 'Generation');
          }
      }
      
      handleRenderImages(scenes);

    } catch (err: any) {
      setError(err.message || "Failed to interpret prompt");
      setIsInterpreting(false);
    }
  };

  const handleRenderImages = (scenes: FiboScene[]) => {
    setIsRendering(true);
    setIsInterpreting(false);
    
    if (!scenes || scenes.length === 0) {
        setIsRendering(false);
        return;
    }
    
    // Initialize slots with null to show loading state immediately
    const placeholders = new Array(scenes.length).fill(null);
    setGeneratedResults(placeholders);
    
    let activeRequests = scenes.length;

    scenes.forEach((scene, index) => {
        // IMPORTANT: Stagger requests to avoid 429 Rate Limits from API providers
        // Decreased delay to 300ms for faster parallel starts
        setTimeout(() => {
            generateImageFromFibo(scene)
                .then(result => {
                    setGeneratedResults(prev => {
                        const next = [...prev];
                        next[index] = result;
                        return next;
                    });
                })
                .catch(err => {
                    console.error(`Generation failed for index ${index}`, err);
                    // Insert error result
                    const errorResult: FiboGenerationResponse = {
                        url: "",
                        seed: 0,
                        source: 'ERROR' 
                    };
                    setGeneratedResults(prev => {
                        const next = [...prev];
                        next[index] = errorResult;
                        return next;
                    });
                })
                .finally(() => {
                    activeRequests--;
                    if (activeRequests === 0) {
                        setIsRendering(false);
                    }
                });
        }, index * 300); 
    });
  };

  const handleWorkflowChange = (id: string) => {
    setSelectedWorkflowId(id);
    const wf = WORKFLOWS.find(w => w.id === id);
    if(wf) setPrompt(wf.basePrompt);
    handleReset();
  };

  const getSourceLabel = (source: string) => {
    switch(source) {
        case 'MCP': return 'Bria MCP';
        case 'REST': return 'Bria API';
        case 'REST_V2': return 'Bria API v2';
        case 'REST_STAGING': return 'Bria Staging';
        case 'ERROR': return 'Failed';
        default: return 'Unknown';
    }
  };

  if (showLanding) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />;
  }

  return (
    <div className="flex h-screen w-full bg-[#09090b] text-zinc-200 font-sans overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-80 border-r border-zinc-800 p-0 flex-shrink-0 bg-[#0c0c0e] flex flex-col h-full overflow-hidden z-30 shadow-2xl">
        {/* Sidebar Header */}
        <div className="p-6 pb-4 cursor-pointer flex-shrink-0 group" onClick={handleReset}>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-sm group-hover:rotate-180 transition-transform duration-500"></div>
                FIBO Studio OS
            </h1>
            <p className="text-xs text-zinc-500 mt-1 pl-6">Agentic Production System v3.0</p>
        </div>

        {/* Sidebar Tabs */}
        <div className="px-6 pb-4">
             <div className="bg-zinc-900 p-1 rounded-lg flex gap-1">
                 <button 
                    onClick={() => setSidebarTab('studio')}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${sidebarTab === 'studio' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                 >
                    Studio Agents
                 </button>
                 <button 
                    onClick={() => setSidebarTab('library')}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${sidebarTab === 'library' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                 >
                    Explore
                 </button>
             </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-6 custom-scrollbar">
            {sidebarTab === 'studio' ? (
                <AgentsPanel 
                    selectedWorkflow={selectedWorkflowId}
                    onSelectWorkflow={handleWorkflowChange}
                    visualDirectorConfig={visualDirectorConfig}
                    onConfigChange={(k, v) => setVisualDirectorConfig(prev => ({...prev, [k]: v}))}
                    batchMode={batchMode}
                    onBatchModeChange={(val) => { setBatchMode(val); handleReset(); }}
                    proConfig={proConfig}
                    onProConfigChange={(k, v) => setProConfig(prev => ({...prev, [k]: v}))}
                />
            ) : (
                <LibraryPanel onLoadBlueprint={handleLoadBlueprint} />
            )}
        </div>

        {/* Sidebar Footer - Logout */}
        <div className="p-4 border-t border-zinc-800 bg-[#0c0c0e]">
            <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-md hover:bg-zinc-800 hover:text-white transition-colors group"
            >
                <svg className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                Exit Session
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative min-w-0">
        
        {/* Top Bar */}
        <div className="h-auto py-4 border-b border-zinc-800 flex flex-col items-center px-8 bg-[#09090b] shrink-0 z-20 shadow-sm">
            <div className="flex-1 max-w-4xl mx-auto w-full relative">
                <input 
                    type="text" 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={
                        fiboScenes.length > 0 && !batchMode
                        ? "Refine this scene (e.g., 'Make the lighting warmer')..." 
                        : batchMode 
                            ? "Describe the concept for batch variations..." 
                            : "Describe your creative vision..."
                    }
                    className={`w-full bg-zinc-900/50 border rounded-lg pl-4 pr-40 py-3 text-zinc-200 focus:outline-none focus:ring-1 transition-all placeholder-zinc-600 text-sm ${fiboScenes.length > 0 && !batchMode ? 'border-indigo-500/50 focus:border-indigo-500 focus:ring-indigo-500' : 'border-zinc-700 focus:border-indigo-500 focus:ring-indigo-500'}`}
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />
                <div className="absolute right-1.5 top-1.5 bottom-1.5 flex gap-2">
                    {fiboScenes.length > 0 && (
                        <button 
                            onClick={handleReset}
                            className="px-3 rounded-md font-medium text-xs transition-colors bg-zinc-800 hover:bg-zinc-700 text-zinc-400"
                        >
                            New
                        </button>
                    )}
                    <button 
                        onClick={handleGenerate}
                        disabled={isInterpreting || isRendering}
                        className={`px-4 rounded-md font-medium text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-indigo-900/20 ${
                            fiboScenes.length > 0 && !batchMode 
                                ? 'bg-indigo-600 hover:bg-indigo-500 text-white' 
                                : batchMode 
                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                        }`}
                    >
                        {isInterpreting ? 'Agent Working...' : isRendering ? 'Producing...' : (fiboScenes.length > 0 && !batchMode ? 'Refine Blueprint' : 'Compile Scene → Image')}
                        {!isInterpreting && !isRendering && (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        )}
                    </button>
                </div>
            </div>
            
            {/* Determinism Explainer */}
            <div className="mt-3 text-[10px] text-zinc-500 font-mono flex items-center gap-2 tracking-wide opacity-80 hover:opacity-100 transition-opacity">
                <span className="text-indigo-400">🔁</span> 
                <span>Same JSON = same image. Change one field → controlled variation.</span>
            </div>
        </div>

        {/* Workspace */}
        <div className="flex-1 flex overflow-hidden min-h-0">
            
            {/* JSON View (Left) */}
            <div className="w-1/2 flex flex-col border-r border-zinc-800 bg-[#050505] min-w-0 relative">
                
                {/* Header for JSON View */}
                <div className="h-10 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-900/20 shrink-0">
                    <h2 className="text-zinc-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                        JSON Blueprint {batchMode && fiboScenes.length > 0 && <span className="text-zinc-600 ml-2">Variant #{selectedResultIndex + 1}</span>}
                    </h2>
                    
                    <div className="flex items-center gap-3">
                         {fiboScenes.length > 0 && (
                            <span className="text-[10px] text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-900/30">Gemini 2.5 Validated</span>
                        )}
                        {/* History Toggle */}
                        <button 
                            onClick={() => setShowHistory(!showHistory)}
                            className={`p-1.5 rounded transition-colors ${showHistory ? 'bg-indigo-900 text-white' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
                            title="Version History"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </button>
                    </div>
                </div>

                {/* Content Area - toggles between JsonViewer and VersionHistory */}
                <div className="flex-1 relative overflow-hidden">
                    {showHistory ? (
                        <VersionHistory 
                            history={history}
                            onRestore={handleRestoreHistory}
                            onClose={() => setShowHistory(false)}
                        />
                    ) : (
                        <div className="h-full overflow-y-auto p-4 custom-scrollbar">
                            {isInterpreting ? (
                                <div className="flex flex-col items-center justify-center h-full space-y-4">
                                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-zinc-500 text-xs animate-pulse">
                                        {batchMode ? "Generating multiple scene variations..." : fiboScenes.length > 0 ? "Interpreter Agent is refining the blueprint..." : "Translating intent into structured JSON..."}
                                    </p>
                                </div>
                            ) : (
                                <JsonViewer data={currentJson} onUpdate={handleJsonUpdate} />
                            )}
                        </div>
                    )}
                </div>

                {/* Agent Logs (Always visible at bottom of left panel) */}
                <div className="h-40 border-t border-zinc-800 bg-[#0c0c0e] p-4 font-mono text-[10px] leading-relaxed overflow-y-auto shrink-0 custom-scrollbar z-10">
                    <h3 className="text-zinc-600 font-bold mb-2 uppercase tracking-wider flex justify-between">
                        <span>System Logs</span>
                        <span className="text-zinc-700">v3.0.1</span>
                    </h3>
                    <div className="space-y-1.5 text-zinc-500">
                        <p className="opacity-50 text-green-800">[System] Bria Neural API... Connected</p>
                        <p className="opacity-50 text-purple-900">[System] MCP Protocol... Active</p>
                        
                        {isInterpreting && (
                            <>
                                <p className="text-indigo-400 animate-pulse">
                                    > [Interpreter Agent] Translating natural language intent...
                                </p>
                                {batchMode && (
                                    <p className="text-emerald-500">
                                        > [Batch Agent] Forking 4 parallel generation threads...
                                    </p>
                                )}
                            </>
                        )}
                        
                        {fiboScenes.length > 0 && !isInterpreting && (
                             <p className="text-emerald-500">
                                > [JSON Compiler] Blueprint {fiboScenes.length > 1 ? 'Variations' : ''} Locked.
                            </p>
                        )}
                        
                        {isRendering && (
                            <p className="text-orange-400 animate-pulse">
                                > [FIBO Pipeline] Compiling JSON to Pixel Stream (Staggered Mode)...
                            </p>
                        )}
                        
                        {generatedResults.map((res, i) => {
                            if (!res) return null;
                            if (res.source === 'ERROR') {
                                return (
                                    <p key={i} className="text-red-500">
                                        > [Error] Asset #{i+1} failed. API limit or network error.
                                    </p>
                                );
                            }
                            return (
                                <p key={i} className={'text-zinc-300'}>
                                    > [Render Complete] Asset #{i+1} delivered via {getSourceLabel(res.source)} (Seed: {res.seed})
                                </p>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Visual View (Right) */}
            <div className="w-1/2 flex flex-col bg-zinc-900/30 relative min-w-0">
                 <div className="h-10 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-900/20 shrink-0">
                    <h2 className="text-zinc-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        Studio Output
                    </h2>
                </div>

                <div className="flex-1 bg-[#09090b] relative overflow-hidden p-4 group flex items-center justify-center">
                    {/* Background Grid */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none" 
                        style={{backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
                    </div>

                    {/* Logic to determine if we show the main loading state (before any items are ready in batch) */}
                    {isInterpreting ? (
                        <div className="flex flex-col items-center justify-center h-full space-y-4 z-10">
                            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-zinc-500 text-xs">Processing intent...</p>
                        </div>
                    ) : generatedResults.length > 0 ? (
                        batchMode ? (
                            // Incremental Grid View for Batch
                            <div className="w-full h-full overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-4">
                                    {generatedResults.map((res, idx) => (
                                        <ImageCard 
                                            key={idx}
                                            result={res}
                                            index={idx}
                                            isSelected={selectedResultIndex === idx}
                                            onClick={() => res && setSelectedResultIndex(idx)}
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            // Single View (Fit to screen)
                            generatedResults[0] ? (
                                <div className="relative w-full h-full flex items-center justify-center">
                                    <ImageCard 
                                        result={generatedResults[0]}
                                        index={0}
                                        isSelected={false}
                                        onClick={() => {}}
                                    />
                                    <div className="absolute bottom-4 right-4 bg-black/80 text-zinc-400 text-[10px] px-2 py-1 rounded border border-zinc-800 flex gap-2">
                                        <span>Seed: {generatedResults[0].seed}</span>
                                        <span className="text-zinc-600">|</span>
                                        <span className={'text-indigo-400'}>
                                            src: {getSourceLabel(generatedResults[0].source)}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                 <div className="flex flex-col items-center justify-center h-full space-y-4 z-10">
                                    <div className="w-16 h-1 bg-zinc-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500 animate-progress"></div>
                                    </div>
                                    <p className="text-zinc-400 text-sm">Rendering high-fidelity asset...</p>
                                </div>
                            )
                        )
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-700 text-sm italic z-10 space-y-3">
                            <div className="w-12 h-12 rounded-full border border-zinc-800 bg-zinc-900/50 flex items-center justify-center shadow-inner">
                                <span className="animate-pulse text-zinc-500">⚡</span>
                            </div>
                            <p>Awaiting JSON blueprint compilation...</p>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                {generatedResults.length > 0 && generatedResults.some(r => r !== null && r.source !== 'ERROR') && (
                    <div className="h-14 border-t border-zinc-800 bg-zinc-900/50 flex items-center justify-end px-4 gap-3 shrink-0">
                        <button 
                            className="text-zinc-400 hover:text-white text-xs font-medium px-3 py-2 rounded hover:bg-zinc-800 transition-colors"
                            onClick={() => {
                                navigator.clipboard.writeText(JSON.stringify(fiboScenes[selectedResultIndex], null, 2));
                                alert("JSON Copied to Clipboard");
                            }}
                        >
                            Copy JSON
                        </button>
                        <button 
                            onClick={handleExport}
                            className="bg-white text-black px-4 py-2 rounded text-xs font-bold hover:bg-zinc-200 transition-colors"
                        >
                            Export Asset
                        </button>
                    </div>
                )}
            </div>
        </div>

        {/* Error Toast */}
        {error && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-red-900/90 text-white px-6 py-3 rounded-lg border border-red-700 shadow-xl flex items-center gap-3 animate-bounce-in z-50">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {error}
                <button onClick={() => setError(null)} className="ml-2 hover:text-red-200">✕</button>
            </div>
        )}

      </main>
      
      <style>{`
        @keyframes progress {
            0% { width: 0% }
            50% { width: 70% }
            100% { width: 100% }
        }
        .animate-progress {
            animation: progress 2s ease-in-out infinite;
        }
        @keyframes bounce-in {
            0% { transform: translate(-50%, 20px); opacity: 0; }
            100% { transform: translate(-50%, 0); opacity: 1; }
        }
        .animate-bounce-in {
            animation: bounce-in 0.3s ease-out forwards;
        }
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fade-in 0.2s ease-out forwards;
        }
        /* Hide scrollbar for Chrome, Safari and Opera */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #09090b; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a; 
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3f3f46; 
        }
      `}</style>
    </div>
  );
}

export default App;