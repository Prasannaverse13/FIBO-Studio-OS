import React from 'react';
import SpiralAnimation from './SpiralAnimation';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="relative w-full min-h-screen bg-black text-white font-sans overflow-hidden flex flex-col selection:bg-indigo-500/30">
      
      {/* Dynamic Spiral Animation Background */}
      <SpiralAnimation />

      {/* Background Noise/Grid overlay */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none z-0" 
           style={{backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px'}}>
      </div>

      {/* Navbar (Top) */}
      <nav className="w-full max-w-[1400px] mx-auto px-6 md:px-12 py-8 flex items-center justify-between z-50">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.5)]">
               <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
            </div>
            <span className="text-xl font-bold tracking-tight">FIBO Studio</span>
         </div>
      </nav>

      {/* Main Content (Centered) */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full"
           style={{
               boxSizing: 'border-box',
               padding: '0px 20px',
               gap: '40px',
           }}>
           
           {/* Hero Section Container */}
           <div className="flex flex-col items-center text-center max-w-5xl mx-auto space-y-8 -mt-10">
               
               {/* Badge */}
               <div className="animate-fade-in-up">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#111] border border-[#222] text-xs font-medium text-zinc-400 shadow-xl backdrop-blur-sm">
                      Next-Gen AI Studio
                  </div>
               </div>

               {/* Heading */}
               <h1 className="text-5xl md:text-8xl font-bold tracking-tighter leading-[1.05] animate-fade-in-up delay-100 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-zinc-500 drop-shadow-sm">
                   Agentic Production <br/>
                   Redefining Creativity.
               </h1>

               {/* Subtitle */}
               <p className="text-lg md:text-xl text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200">
                   Convert natural language into deterministic JSON blueprints for enterprise-grade image generation. Stay ahead with FIBO Studio OS.
               </p>

               {/* Buttons */}
               <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up delay-300 pt-6">
                   <button 
                       onClick={onGetStarted}
                       className="px-10 py-4 bg-white text-black font-bold text-sm rounded-full hover:scale-105 hover:bg-zinc-200 transition-all shadow-[0_0_40px_rgba(255,255,255,0.15)] min-w-[200px]"
                   >
                       Get Started
                   </button>
               </div>
           </div>

           {/* Gradient Arc & Logos */}
           <div className="relative w-full flex justify-center mt-8 md:mt-16">
               {/* Glow Effects */}
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[300px] bg-indigo-600 opacity-20 blur-[100px] rounded-[100%] pointer-events-none mix-blend-screen"></div>
               <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[60vw] h-[250px] bg-purple-600 opacity-15 blur-[80px] rounded-[100%] pointer-events-none mix-blend-screen"></div>

               {/* Logos */}
               <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 animate-fade-in-up delay-500 relative z-10 grayscale mix-blend-plus-lighter hover:opacity-80 transition-opacity duration-500">
                    <span className="text-xl md:text-2xl font-black tracking-widest text-white/80">BRIA.AI</span>
                    <span className="text-xl md:text-2xl font-black tracking-widest text-white/80">GEMINI</span>
                    <span className="text-xl md:text-2xl font-black tracking-widest text-white/80">FIBO</span>
                    <span className="text-xl md:text-2xl font-black tracking-widest text-white/80">MCP</span>
               </div>
           </div>

      </div>

      <style>{`
        @keyframes fade-in-up {
            0% { opacity: 0; transform: translateY(30px); filter: blur(10px); }
            100% { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            opacity: 0;
        }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-500 { animation-delay: 500ms; }
        .delay-700 { animation-delay: 700ms; }
      `}</style>

    </div>
  );
};

export default LandingPage;