import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Play, Pause, RotateCcw, Pencil, Flag } from 'lucide-react';
import { playSound } from '../lib/audio';

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = Math.floor(ms % 1000);

  const minsStr = String(minutes).padStart(2, '0');
  const secsStr = String(seconds).padStart(2, '0');
  const msStr = String(milliseconds).padStart(3, '0');

  return `${minsStr}:${secsStr}.${msStr}`;
}

export interface TimerRef {
  start: () => void;
  pause: () => void;
  reset: () => void;
  recordLap: () => void;
}

export const TimerCard = forwardRef<TimerRef, { title: string; subtitle: string; colorTheme: 'indigo' | 'emerald'; onRunningChange?: (isRunning: boolean) => void }>(({ title, subtitle, colorTheme, onRunningChange }, ref) => {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const [editableTitle, setEditableTitle] = useState(title);
  const [isEditing, setIsEditing] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const start = () => {
    if (!isRunning) {
      playSound('start');
      startTimeRef.current = Date.now() - elapsed;
      intervalRef.current = window.setInterval(() => {
        setElapsed(Date.now() - startTimeRef.current);
      }, 20); // 50fps update rate
      setIsRunning(true);
    }
  };

  const pause = () => {
    if (isRunning) {
      playSound('pause');
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsRunning(false);
    }
  };

  const recordLap = () => {
    if (isRunning && laps.length < 10) {
      playSound('lap');
      setLaps(prev => [...prev, elapsed]);
    }
  };

  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    playSound('reset');
    setIsRunning(false);
    setElapsed(0);
    setLaps([]);
  };

  useImperativeHandle(ref, () => ({
    start,
    pause,
    reset,
    recordLap
  }));

  useEffect(() => {
    onRunningChange?.(isRunning);
  }, [isRunning, onRunningChange]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const totalSeconds = Math.floor(elapsed / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = Math.floor(elapsed % 1000);

  const minsStr = String(minutes).padStart(2, '0');
  const secsStr = String(seconds).padStart(2, '0');
  const msStr = String(milliseconds).padStart(3, '0');
  
  const hasStarted = elapsed > 0;

  const themes = {
    indigo: {
      accentBar: 'bg-indigo-500',
      badgeBg: 'bg-indigo-500/10',
      badgeText: 'text-indigo-400',
      statusRunning: 'text-indigo-400',
      iconBgPlay: 'bg-indigo-500/10',
      iconTextPlay: 'text-indigo-400',
      primaryPlayStyle: 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/20 text-white'
    },
    emerald: {
      accentBar: 'bg-emerald-500',
      badgeBg: 'bg-emerald-500/10',
      badgeText: 'text-emerald-400',
      statusRunning: 'text-emerald-400',
      iconBgPlay: 'bg-emerald-500/10',
      iconTextPlay: 'text-emerald-400',
      primaryPlayStyle: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20 text-white'
    }
  };

  const theme = themes[colorTheme];

  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditing]);

  const handleTitleSubmit = () => {
    setIsEditing(false);
    if (!editableTitle.trim()) {
      setEditableTitle(title);
    }
  };

  return (
    <div className="@container w-full md:w-auto md:flex-1 flex flex-col bg-slate-900/40 border border-slate-800 rounded-3xl p-3 sm:p-4 md:p-6 relative overflow-hidden shadow-2xl min-h-[380px] md:min-h-[350px] min-w-0 shrink-0">
      <div className={`absolute top-0 left-0 w-1 h-full ${theme.accentBar}`}></div>
      
      <div className="flex flex-col @[500px]:flex-row flex-1 gap-3 sm:gap-4 @[500px]:gap-6 min-h-0">
        {/* Timer Section */}
        <div className="flex flex-col w-full @[500px]:w-[45%] shrink-0">
          <div className="mb-2 sm:mb-4 flex items-center justify-between">
            <div className="flex flex-col items-start w-[65%] min-w-0">
              <span className={`px-2 py-0.5 sm:py-1 ${theme.badgeBg} ${theme.badgeText} rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-widest inline-block truncate max-w-full`}>
                {subtitle}
              </span>
              {isEditing ? (
                <input
                  ref={titleInputRef}
                  type="text"
                  value={editableTitle}
                  onChange={(e) => setEditableTitle(e.target.value)}
                  onBlur={handleTitleSubmit}
                  onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
                  className="text-lg sm:text-xl @[500px]:text-2xl font-black mt-1 text-white italic tracking-tighter bg-slate-800/80 border border-slate-600 rounded px-2 py-1 w-full focus:outline-none focus:border-slate-500 transition-all min-w-0"
                />
              ) : (
                <div 
                  className="group/title flex items-center gap-1.5 sm:gap-2 mt-1 cursor-pointer select-none max-w-full min-w-0"
                  onClick={() => setIsEditing(true)}
                  title="點擊修改名稱"
                >
                  <h2 className="text-lg sm:text-xl @[500px]:text-2xl font-black text-white italic tracking-tighter truncate leading-none py-1">{editableTitle}</h2>
                  <Pencil className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500 opacity-0 group-hover/title:opacity-100 transition-opacity shrink-0" />
                </div>
              )}
            </div>
            <div className="text-right shrink-0 ml-2">
              <span className="text-slate-500 text-[9px] sm:text-[10px] uppercase font-bold tracking-widest block">Status</span>
              <p className={`font-mono text-[10px] sm:text-xs uppercase ${isRunning ? theme.statusRunning : 'text-slate-400'}`}>
                {isRunning ? 'RUNNING' : hasStarted ? 'PAUSED' : 'IDLE'}
              </p>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center py-2 sm:py-3 border-y border-slate-800/50 @[500px]:border-y-0 my-1 sm:my-2 @[500px]:my-0 min-h-[80px]">
            <div className={`font-mono text-3xl sm:text-4xl @[500px]:text-5xl font-black tracking-tighter flex items-baseline justify-center ${isRunning || hasStarted ? 'text-white' : 'text-slate-700'}`}>
              <span className={isRunning || hasStarted ? 'text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400' : ''}>
                {minsStr}:{secsStr}.
              </span>
              <span className={`text-xl sm:text-2xl @[500px]:text-3xl ${isRunning || hasStarted ? 'text-slate-400 opacity-80' : 'text-slate-700'}`}>
                {msStr}
              </span>
            </div>
            <div className={`mt-1 sm:mt-2 text-[8px] sm:text-[9px] font-medium tracking-[0.1em] sm:tracking-[0.2em] uppercase italic ${isRunning || hasStarted ? 'text-slate-500' : 'text-slate-600'}`}>
              Min : Sec . MS
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mt-auto shrink-0 pb-1 @[500px]:pb-0">
            {/* Play Button */}
            <button 
              onClick={start}
              disabled={isRunning}
              className={`h-9 sm:h-10 @[500px]:h-12 rounded-xl flex items-center justify-center transition-all group active:scale-95 ${
                isRunning 
                  ? 'bg-slate-800/50 cursor-not-allowed border border-slate-800' 
                  : hasStarted 
                    ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700'
                    : `${theme.primaryPlayStyle} shadow-lg shadow-black/20`
              }`}
            >
              {isRunning ? (
                <Play className="w-3.5 h-3.5 text-slate-700 ml-0.5" fill="currentColor" />
              ) : hasStarted ? (
                <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full ${theme.iconBgPlay} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Play className={`w-3 h-3 ${theme.iconTextPlay} ml-0.5`} fill="currentColor" />
                </div>
              ) : (
                <Play className="w-4 h-4 sm:w-5 sm:h-5 ml-1" fill="currentColor" />
              )}
            </button>

            {/* Pause Button */}
            <button 
              onClick={pause}
              disabled={!isRunning}
              className={`h-9 sm:h-10 @[500px]:h-12 rounded-xl flex items-center justify-center transition-all group active:scale-95 ${
                isRunning 
                  ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700' 
                  : 'bg-slate-800/50 cursor-not-allowed border border-slate-800'
              }`}
            >
              {isRunning ? (
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Pause className="w-3 h-3 text-amber-400" fill="currentColor" />
                </div>
              ) : (
                <Pause className="w-3.5 h-3.5 text-slate-700" fill="currentColor" />
              )}
            </button>
            
            {/* Lap Button */}
             <button 
              onClick={recordLap}
              disabled={!isRunning || laps.length >= 10}
              className={`h-9 sm:h-10 @[500px]:h-12 rounded-xl flex items-center justify-center transition-all group active:scale-95 ${
                isRunning && laps.length < 10
                  ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700' 
                  : 'bg-slate-800/50 cursor-not-allowed border border-slate-800'
              }`}
            >
              {isRunning && laps.length < 10 ? (
                 <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-cyan-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                   <Flag className="w-3 h-3 text-cyan-400" />
                 </div>
              ) : (
                 <Flag className="w-3.5 h-3.5 text-slate-700" />
              )}
            </button>

            {/* Reset Button */}
            <button 
              onClick={reset}
              disabled={!hasStarted}
              className={`h-9 sm:h-10 @[500px]:h-12 rounded-xl flex items-center justify-center transition-all group active:scale-95 ${
                hasStarted 
                  ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700' 
                  : 'bg-slate-800/50 cursor-not-allowed border border-slate-800'
              }`}
            >
              {hasStarted ? (
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-rose-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <RotateCcw className="w-3 h-3 text-rose-400" strokeWidth={2.5} />
                </div>
              ) : (
                <RotateCcw className="w-3.5 h-3.5 text-slate-700" strokeWidth={2.5} />
              )}
            </button>
          </div>
        </div>

        {/* Separators */}
        <div className="hidden @[500px]:block w-px bg-slate-800/50 shrink-0 mx-1 sm:mx-2"></div>
        
        {/* Laps List */}
        <div className="flex-1 flex flex-col @[500px]:w-[55%] min-h-0 bg-slate-900/50 rounded-xl sm:rounded-2xl p-2 sm:p-3 border border-slate-800/50">
          <div className="flex items-center justify-between mb-1 sm:mb-2 shrink-0 px-1">
            <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-500 tracking-widest shrink-0">Lap Records</span>
            <span className="text-[9px] font-mono text-slate-600 bg-slate-800/50 px-2 py-0.5 rounded-full shrink-0">{laps.length}/10</span>
          </div>
          
          <div className="flex-1 relative min-h-[120px] @[500px]:min-h-0">
            <div className="absolute inset-0 overflow-y-auto pr-1 custom-scrollbar flex flex-col justify-start">
              {laps.length === 0 ? (
                <div className="h-full flex flex-col justify-center items-center text-slate-600 space-y-1 sm:space-y-2 pb-2">
                  <Flag className="w-4 h-4 sm:w-5 sm:h-5 opacity-20" />
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold">No Laps</span>
                </div>
              ) : (
                [...laps].reverse().map((lapTime, reversedIdx) => {
                  const i = laps.length - 1 - reversedIdx;
                  const lapTotalSec = Math.floor(lapTime / 1000);
                  const lapMins = String(Math.floor(lapTotalSec / 60)).padStart(2, '0');
                  const lapSecs = String(lapTotalSec % 60).padStart(2, '0');
                  const lapMs = String(Math.floor(lapTime % 1000)).padStart(3, '0');
                  
                  const isLast = i === laps.length - 1;

                  return (
                    <div key={i} className={`flex items-center justify-between px-2 sm:px-2.5 py-1.5 mb-1 sm:mb-1.5 rounded-lg sm:rounded-xl transition-colors ${isLast ? 'bg-slate-800/80 text-white shadow-sm shadow-black/20' : 'bg-slate-800/30 text-slate-400 border border-slate-800/50 shrink-0'}`}>
                      <span className={`text-[8px] sm:text-[9px] font-bold uppercase tracking-widest ${isLast ? theme.badgeText : 'text-slate-500'}`}>LAP {String(i + 1).padStart(2, '0')}</span>
                      <span className="font-mono text-[10px] sm:text-xs font-medium flex items-baseline">
                        {lapMins}:{lapSecs}.<span className={isLast ? 'text-slate-300 text-[8px] sm:text-[9px]' : 'text-slate-500 text-[8px] sm:text-[9px]'}>{lapMs}</span>
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
