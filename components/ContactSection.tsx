"use client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ContactSection({ lenisRef }: { lenisRef: any }) {
  const replay = () => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { duration: 2, easing: (t: number) => 1 - Math.pow(1 - t, 4) });
    }
  };

  return (
    <div className="w-full h-full bg-white flex flex-col items-center justify-center relative">
      {/* Container for links */}
      <div className="flex flex-col w-full max-w-7xl px-8 md:px-16">
        
        {/* LINKEDIN */}
        <a 
          href="https://www.linkedin.com/in/htet-arkar-ai/" 
          target="_blank" 
          rel="noreferrer" 
          className="group relative overflow-hidden w-full py-8 md:py-12 border-b border-neutral-200 cursor-pointer flex items-center justify-between"
        >
           <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] z-0 origin-bottom"></div>
           <h2 className="text-[12vw] md:text-[8vw] font-bold uppercase tracking-tighter text-black group-hover:text-white transition-colors duration-500 relative z-10 leading-none mix-blend-difference">
             LINKEDIN
           </h2>
           <span className="relative z-10 text-black group-hover:text-white transition-colors duration-500 font-mono text-sm tracking-widest uppercase">
             [01] Connect
           </span>
        </a>

        {/* EMAIL */}
        <a 
          href="mailto:arkar.acc2003@gmail.com" 
          className="group relative overflow-hidden w-full py-8 md:py-12 border-b border-neutral-200 cursor-pointer flex items-center justify-between"
        >
           <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] z-0 origin-bottom"></div>
           <h2 className="text-[12vw] md:text-[8vw] font-bold uppercase tracking-tighter text-black group-hover:text-white transition-colors duration-500 relative z-10 leading-none mix-blend-difference">
             EMAIL
           </h2>
           <span className="relative z-10 text-black group-hover:text-white transition-colors duration-500 font-mono text-sm tracking-widest uppercase">
             [02] Reach Out
           </span>
        </a>

        {/* GITHUB */}
        <a 
          href="https://github.com/arkarOnHub" 
          target="_blank" 
          rel="noreferrer" 
          className="group relative overflow-hidden w-full py-8 md:py-12 border-b border-neutral-200 cursor-pointer flex items-center justify-between"
        >
           <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] z-0 origin-bottom"></div>
           <h2 className="text-[12vw] md:text-[8vw] font-bold uppercase tracking-tighter text-black group-hover:text-white transition-colors duration-500 relative z-10 leading-none mix-blend-difference">
             GITHUB
           </h2>
           <span className="relative z-10 text-black group-hover:text-white transition-colors duration-500 font-mono text-sm tracking-widest uppercase">
             [03] Open Source
           </span>
        </a>
      </div>

      {/* Replay Button */}
      <button
        onClick={replay}
        className="absolute bottom-10 md:bottom-14 px-8 py-4 bg-black text-white text-sm font-mono tracking-widest uppercase hover:bg-neutral-800 transition-colors rounded-full z-20 overflow-hidden group"
      >
        <span className="relative z-10">Replay Journey</span>
      </button>
    </div>
  );
}
