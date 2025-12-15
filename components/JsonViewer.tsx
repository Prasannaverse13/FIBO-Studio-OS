import React, { useState, useEffect } from 'react';
import { FiboScene } from '../types';

interface JsonViewerProps {
  data: FiboScene | null;
  onUpdate?: (newData: FiboScene) => void;
}

const JsonViewer: React.FC<JsonViewerProps> = ({ data, onUpdate }) => {
  const [text, setText] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(true);

  // Sync local text state when external data changes
  useEffect(() => {
    if (data) {
      setText(JSON.stringify(data, null, 2));
      setIsValid(true);
    } else {
      setText('');
    }
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    
    try {
      const parsed = JSON.parse(newText);
      setIsValid(true);
      if (onUpdate) {
        onUpdate(parsed as FiboScene);
      }
    } catch (err) {
      setIsValid(false);
    }
  };

  if (!data && !text) return (
    <div className="flex flex-col items-center justify-center h-full text-zinc-600 text-xs italic p-8 text-center border-2 border-dashed border-zinc-800 rounded-lg mx-4 mt-4 bg-zinc-900/20">
      <p>No blueprint compiled yet.</p>
      <p className="mt-2 text-zinc-700">Agents will output strict, deterministic JSON here.</p>
      <p className="mt-4 text-indigo-500 cursor-pointer hover:underline" onClick={() => setText('{\n  "short_description": "Custom scene..."\n}')}>
        [Paste your own JSON]
      </p>
    </div>
  );

  return (
    <div className="relative group h-full flex flex-col">
        {/* Hero Header */}
        <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[10px] font-bold text-indigo-400 tracking-widest uppercase bg-indigo-950/30 px-2 py-1 rounded border border-indigo-900/50 shadow-[0_0_10px_rgba(79,70,229,0.2)]">
                Single Source of Truth (Editable)
            </span>
            <span className={`text-[10px] font-mono transition-colors ${isValid ? 'text-zinc-500' : 'text-red-500'}`}>
                {isValid ? 'v3.0 Schema' : 'Invalid JSON'}
            </span>
        </div>
        
        {/* Editor Area */}
        <div className={`flex-1 relative font-mono text-sm bg-[#0d0d0d] rounded-lg border overflow-hidden flex flex-col shadow-inner transition-colors ${isValid ? 'border-zinc-800 focus-within:border-indigo-500/50' : 'border-red-900/50'}`}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-20 pointer-events-none"></div>
            
            <textarea
                value={text}
                onChange={handleChange}
                spellCheck={false}
                className="flex-1 w-full h-full bg-transparent p-4 custom-scrollbar text-green-400 focus:outline-none resize-none leading-relaxed placeholder-zinc-700"
                placeholder="// Paste or edit FIBO JSON blueprint here..."
            />
            
            {/* Status Indicator */}
            <div className="absolute bottom-2 right-2 pointer-events-none">
                <div className={`w-2 h-2 rounded-full ${isValid ? 'bg-green-500/50' : 'bg-red-500'}`}></div>
            </div>
        </div>
        
        {/* Hint */}
        <div className="mt-2 text-[10px] text-zinc-600 text-right font-mono flex justify-between">
            <span>{isValid ? 'Live Sync Active' : 'Syntax Error'}</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                You can edit this JSON manually
            </span>
        </div>
    </div>
  );
};

export default JsonViewer;