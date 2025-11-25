import { useEffect, useState } from 'react';
import { X, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ExportProgress } from '@/lib/exporter';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  progress: ExportProgress | null;
  isExporting: boolean;
  error: string | null;
  onCancel?: () => void;
}

export function ExportDialog({
  isOpen,
  onClose,
  progress,
  isExporting,
  error,
  onCancel,
}: ExportDialogProps) {
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!isExporting && progress && progress.percentage >= 100 && !error) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isExporting, progress, error, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 animate-in fade-in duration-200"
        onClick={isExporting ? undefined : onClose}
      />
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[60] bg-black rounded-xl shadow-2xl border border-white/10 p-6 w-[90vw] max-w-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {showSuccess ? (
              <>
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                  <Download className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-lg font-semibold text-white block">Export Complete</span>
                  <span className="text-sm text-white/50">Your video is ready</span>
                </div>
              </>
            ) : (
              <>
                {isExporting ? (
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <Download className="w-6 h-6 text-white" />
                  </div>
                )}
                <div>
                  <span className="text-lg font-semibold text-white block">
                    {error ? 'Export Failed' : isExporting ? 'Exporting Video' : 'Export Video'}
                  </span>
                  <span className="text-sm text-white/50">
                    {error ? 'Please try again' : isExporting ? 'This may take a moment...' : 'Ready to start'}
                  </span>
                </div>
              </>
            )}
          </div>
          {!isExporting && (
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>

        {error && (
          <div className="mb-6">
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-start gap-3">
              <div className="p-1 bg-white/10 rounded-full">
                <X className="w-3 h-3 text-white" />
              </div>
              <p className="text-sm text-white/70 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {isExporting && progress && (
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-medium text-white/50 uppercase tracking-wider">
                <span>Progress</span>
                <span className="font-mono text-white">{progress.percentage.toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-white transition-all duration-300 ease-out"
                  style={{ width: `${Math.min(progress.percentage, 100)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="text-xs text-white/50 uppercase tracking-wider mb-2">Current Frame</div>
                <div className="text-white font-mono text-lg font-medium">
                  {progress.currentFrame} <span className="text-white/50 text-sm">/ {progress.totalFrames}</span>
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="text-xs text-white/50 uppercase tracking-wider mb-2">Status</div>
                <div className="text-white font-medium text-sm flex items-center gap-2 h-[28px]">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  Processing
                </div>
              </div>
            </div>

            {onCancel && (
              <div className="pt-2">
                <Button
                  onClick={onCancel}
                  variant="destructive"
                  className="w-full"
                >
                  Cancel Export
                </Button>
              </div>
            )}
          </div>
        )}

        {showSuccess && (
          <div className="text-center py-4">
            <p className="text-base text-white font-medium">Video saved successfully!</p>
          </div>
        )}
      </div>
    </>
  );
}
