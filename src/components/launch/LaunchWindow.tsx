import { useState, useEffect } from "react";
import { useScreenRecorder } from "../../hooks/useScreenRecorder";
import { Button } from "../ui/button";
import { BsRecordCircle } from "react-icons/bs";
import { FaRegStopCircle } from "react-icons/fa";
import { MdMonitor } from "react-icons/md";
import { cn } from "@/lib/utils";

export function LaunchWindow() {
  const { recording, toggleRecording } = useScreenRecorder();
  const [selectedSource, setSelectedSource] = useState("Screen");
  const [hasSelectedSource, setHasSelectedSource] = useState(false);

  useEffect(() => {
    const checkSelectedSource = async () => {
      if (window.electronAPI) {
        const source = await window.electronAPI.getSelectedSource();
        if (source) {
          setSelectedSource(source.name);
          setHasSelectedSource(true);
        } else {
          setSelectedSource("Screen");
          setHasSelectedSource(false);
        }
      }
    };

    checkSelectedSource();
    
    const interval = setInterval(checkSelectedSource, 500);
    return () => clearInterval(interval);
  }, []);

  const openSourceSelector = () => {
    if (window.electronAPI) {
      window.electronAPI.openSourceSelector();
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-transparent">
      <div
        className="w-full max-w-full mx-auto flex items-center gap-4 px-6 py-4 rounded-xl bg-black border border-white/10 shadow-lg min-w-0"
        style={{ 
          WebkitAppRegion: 'drag',
        } as React.CSSProperties}
      >
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "gap-2 text-white hover:bg-white/10 px-4 py-2 flex-1 min-w-0 justify-start text-sm rounded-lg",
            "transition-all"
          )}
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          onClick={openSourceSelector}
        >
          <MdMonitor size={16} className="flex-shrink-0" />
          <span className="font-medium truncate min-w-0">{selectedSource}</span>
        </Button>

        <div className="w-px h-8 bg-white/10 flex-shrink-0" />

        <Button
          variant={recording ? "default" : hasSelectedSource ? "outline" : "ghost"}
          size="sm"
          onClick={hasSelectedSource ? toggleRecording : openSourceSelector}
          disabled={!hasSelectedSource && !recording}
          className={cn(
            "gap-2 px-4 py-2 flex-shrink-0 justify-end text-sm rounded-lg transition-all",
            !hasSelectedSource && !recording && "text-white/40"
          )}
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          {recording ? (
            <>
              <FaRegStopCircle size={16} className="flex-shrink-0" />
              <span className="font-medium">Stop</span>
            </>
          ) : (
            <>
              <BsRecordCircle size={16} className="flex-shrink-0" />
              <span className="font-medium">Record</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
