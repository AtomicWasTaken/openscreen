import { Play, Pause } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface PlaybackControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onTogglePlayPause: () => void;
  onSeek: (time: number) => void;
}

export default function PlaybackControls({
  isPlaying,
  currentTime,
  duration,
  onTogglePlayPause,
  onSeek,
}: PlaybackControlsProps) {
  function formatTime(seconds: number) {
    if (!isFinite(seconds) || isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function handleSeekChange(e: React.ChangeEvent<HTMLInputElement>) {
    onSeek(parseFloat(e.target.value));
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-4 px-4 py-3 rounded-lg bg-white/5 border border-white/10 transition-all hover:bg-white/10">
      <Button
        onClick={onTogglePlayPause}
        variant="ghost"
        size="icon"
        className={cn(
          "w-8 h-8 rounded-full border border-white/10",
          isPlaying 
            ? "bg-white/10 text-white hover:bg-white/15" 
            : "bg-white text-black hover:bg-white/90"
        )}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <Pause size={14} fill="currentColor" />
        ) : (
          <Play size={14} fill="currentColor" style={{ marginLeft: '2px' }} />
        )}
      </Button>
      
      <span className="text-xs font-medium text-white/70 tabular-nums w-[40px] text-right">
        {formatTime(currentTime)}
      </span>
      
      <div className="flex-1 relative h-6 flex items-center group">
        <div className="absolute left-0 right-0 h-0.5 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleSeekChange}
          step="0.01"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        
        <div 
          className="absolute w-2.5 h-2.5 bg-white rounded-full pointer-events-none transition-transform group-hover:scale-125"
          style={{ 
            left: `${progress}%`,
            transform: 'translateX(-50%)'
          }}
        />
      </div>
      
      <span className="text-xs font-medium text-white/50 tabular-nums w-[40px]">
        {formatTime(duration)}
      </span>
    </div>
  );
}
