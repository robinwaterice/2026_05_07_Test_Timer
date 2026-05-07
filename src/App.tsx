/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, useState } from 'react';
import { TimerCard, type TimerRef } from './components/TimerCard';
import { Activity, Play, Pause, RotateCcw } from 'lucide-react';

export default function App() {
  const timer1Ref = useRef<TimerRef>(null);
  const timer2Ref = useRef<TimerRef>(null);
  const [timer1Running, setTimer1Running] = useState(false);
  const [timer2Running, setTimer2Running] = useState(false);

  const isGlobalRunning = timer1Running || timer2Running;

  const handleToggle = () => {
    if (isGlobalRunning) {
      timer1Ref.current?.pause();
      timer2Ref.current?.pause();
    } else {
      timer1Ref.current?.start();
      timer2Ref.current?.start();
    }
  };

  const handleSimultaneousReset = () => {
    timer1Ref.current?.reset();
    timer2Ref.current?.reset();
  };

  return (
    <div className="h-[100dvh] w-full bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden select-none">
      {/* Top Navigation Bar */}
      <nav className="h-16 shrink-0 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-4 md:px-8 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-sm md:text-lg font-bold tracking-tight uppercase text-slate-300">ROBIN的計時器</h1>
        </div>
        <div className="flex items-center gap-6 hidden sm:flex">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">System Status</span>
            <span className="text-xs text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Ready
            </span>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col md:flex-row p-3 xl:p-8 gap-3 xl:gap-8 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 to-slate-950 overflow-y-auto overflow-x-hidden w-full max-w-[1600px] mx-auto min-h-0 relative">
        <TimerCard 
          ref={timer1Ref}
          title="GROUP A" 
          subtitle="Primary Track"
          colorTheme="indigo" 
          onRunningChange={setTimer1Running}
        />
        <TimerCard 
          ref={timer2Ref}
          title="GROUP B" 
          subtitle="Secondary Track"
          colorTheme="emerald" 
          onRunningChange={setTimer2Running}
        />
      </main>

      {/* Synchronized Controls */}
      <div className="shrink-0 px-4 md:px-8 py-3 md:py-4 bg-slate-900/30 border-t border-slate-800/50 flex flex-wrap items-center justify-center gap-3 relative z-10 w-full">
         <button
          onClick={handleToggle}
          className={`flex-1 max-w-[300px] flex items-center justify-center gap-3 min-w-[140px] h-12 rounded-xl font-bold uppercase tracking-[0.1em] sm:tracking-[0.2em] shadow-lg transition-all active:scale-[0.98] group text-sm ${
            isGlobalRunning
              ? "bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 shadow-slate-900/30"
              : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-900/30"
          }`}
        >
          {isGlobalRunning ? (
            <Pause className="w-4 h-4 group-hover:scale-110 transition-transform" fill="currentColor" />
          ) : (
             <Play className="w-4 h-4 group-hover:scale-110 transition-transform" fill="currentColor" />
          )}
          <span>{isGlobalRunning ? '停止' : '開始'}</span>
        </button>
         <button
          onClick={handleSimultaneousReset}
          className="flex-1 max-w-[300px] flex items-center justify-center gap-3 min-w-[140px] h-12 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded-xl font-bold uppercase tracking-[0.1em] sm:tracking-[0.2em] shadow-lg shadow-slate-900/30 transition-all active:scale-[0.98] border border-slate-700 group text-sm"
        >
          <RotateCcw className="w-4 h-4 group-hover:-rotate-90 transition-transform duration-300" strokeWidth={2.5} />
          <span>重置</span>
        </button>
      </div>

      {/* Operation Guide Footer */}
      <footer className="h-12 bg-slate-900 border-t border-slate-800 flex items-center px-4 md:px-8 gap-10 hidden md:flex shrink-0">
        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest hidden lg:block">Operation Guide:</div>
        <div className="flex gap-4 md:gap-6">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">START</span>
            <span className="text-[10px] text-slate-500 uppercase">Initiate</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">PAUSE</span>
            <span className="text-[10px] text-slate-500 uppercase">Hold</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">LAP</span>
            <span className="text-[10px] text-slate-500 uppercase">Record Time</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">RESET</span>
            <span className="text-[10px] text-slate-500 uppercase">Clear</span>
          </div>
        </div>
        <div className="ml-auto text-[10px] text-slate-600 font-medium italic">
          Designed for Vite + React TS Single Viewport v1.0.4
        </div>
      </footer>
    </div>
  );
}
