import { useEffect, useRef } from "react";
import { getAssetPath } from "@/lib/assetPath";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import Colorful from '@uiw/react-color-colorful';
import { hsvaToHex } from '@uiw/color-convert';
import { Trash2, Download, Crop, X, Bug, Upload, Coffee } from "lucide-react";
import { toast } from "sonner";
import type { ZoomDepth, CropRegion } from "./types";
import { CropControl } from "./CropControl";

const WALLPAPER_COUNT = 23;
const WALLPAPER_RELATIVE = Array.from({ length: WALLPAPER_COUNT }, (_, i) => `wallpapers/wallpaper${i + 1}.jpg`);
const GRADIENTS = [
  "linear-gradient( 111.6deg,  rgba(114,167,232,1) 9.4%, rgba(253,129,82,1) 43.9%, rgba(253,129,82,1) 54.8%, rgba(249,202,86,1) 86.3% )",
  "linear-gradient(120deg, #d4fc79 0%, #96e6a1 100%)",
  "radial-gradient( circle farthest-corner at 3.2% 49.6%,  rgba(80,12,139,0.87) 0%, rgba(161,10,144,0.72) 83.6% )",
  "linear-gradient( 111.6deg,  rgba(0,56,68,1) 0%, rgba(163,217,185,1) 51.5%, rgba(231, 148, 6, 1) 88.6% )",
  "linear-gradient( 107.7deg,  rgba(235,230,44,0.55) 8.4%, rgba(252,152,15,1) 90.3% )",
  "linear-gradient( 91deg,  rgba(72,154,78,1) 5.2%, rgba(251,206,70,1) 95.9% )",
  "radial-gradient( circle farthest-corner at 10% 20%,  rgba(2,37,78,1) 0%, rgba(4,56,126,1) 19.7%, rgba(85,245,221,1) 100.2% )",
  "linear-gradient( 109.6deg,  rgba(15,2,2,1) 11.2%, rgba(36,163,190,1) 91.1% )",
  "linear-gradient(135deg, #FBC8B4, #2447B1)",
  "linear-gradient(109.6deg, #F635A6, #36D860)",
  "linear-gradient(90deg, #FF0101, #4DFF01)",
  "linear-gradient(315deg, #EC0101, #5044A9)",
  "linear-gradient(45deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)",
  "linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%)",
  "linear-gradient(to right, #ff8177 0%, #ff867a 0%, #ff8c7f 21%, #f99185 52%, #cf556c 78%, #b12a5b 100%)",
  "linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)",
  "linear-gradient(to right, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(to top, #fcc5e4 0%, #fda34b 15%, #ff7882 35%, #c8699e 52%, #7046aa 71%, #0c1db8 87%, #020f75 100%)",
  "linear-gradient(to right, #fa709a 0%, #fee140 100%)",
  "linear-gradient(to top, #30cfd0 0%, #330867 100%)",
  "linear-gradient(to top, #c471f5 0%, #fa71cd 100%)",
  "linear-gradient(to right, #f78ca0 0%, #f9748f 19%, #fd868c 60%, #fe9a8b 100%)",
  "linear-gradient(to top, #48c6ef 0%, #6f86d6 100%)",
  "linear-gradient(to right, #0acffe 0%, #495aff 100%)",
];

interface SettingsPanelProps {
  selected: string;
  onWallpaperChange: (path: string) => void;
  selectedZoomDepth?: ZoomDepth | null;
  onZoomDepthChange?: (depth: ZoomDepth) => void;
  selectedZoomId?: string | null;
  onZoomDelete?: (id: string) => void;
  showShadow?: boolean;
  onShadowChange?: (showShadow: boolean) => void;
  showBlur?: boolean;
  onBlurChange?: (showBlur: boolean) => void;
  cropRegion?: CropRegion;
  onCropChange?: (region: CropRegion) => void;
  videoElement?: HTMLVideoElement | null;
  onExport?: () => void;
}

export default SettingsPanel;

const ZOOM_DEPTH_OPTIONS: Array<{ depth: ZoomDepth; label: string }> = [
  { depth: 1, label: "1.25×" },
  { depth: 2, label: "1.5×" },
  { depth: 3, label: "1.8×" },
  { depth: 4, label: "2.2×" },
  { depth: 5, label: "3.5×" },
];

export function SettingsPanel({ selected, onWallpaperChange, selectedZoomDepth, onZoomDepthChange, selectedZoomId, onZoomDelete, showShadow, onShadowChange, showBlur, onBlurChange, cropRegion, onCropChange, videoElement, onExport }: SettingsPanelProps) {
  const [wallpaperPaths, setWallpaperPaths] = useState<string[]>([]);
  const [customImages, setCustomImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const resolved = await Promise.all(WALLPAPER_RELATIVE.map(p => getAssetPath(p)))
        if (mounted) setWallpaperPaths(resolved)
      } catch (err) {
        if (mounted) setWallpaperPaths(WALLPAPER_RELATIVE.map(p => `/${p}`))
      }
    })()
    return () => { mounted = false }
  }, [])
  const [hsva, setHsva] = useState({ h: 0, s: 0, v: 68, a: 1 });
  const [gradient, setGradient] = useState<string>(GRADIENTS[0]);
  const [showCropDropdown, setShowCropDropdown] = useState(false);

  const zoomEnabled = Boolean(selectedZoomDepth);
  
  const handleDeleteClick = () => {
    if (selectedZoomId && onZoomDelete) {
      onZoomDelete(selectedZoomId);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type - only allow JPG/JPEG
    const validTypes = ['image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type', {
        description: 'Please upload a JPG or JPEG image file.',
      });
      event.target.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setCustomImages(prev => [...prev, dataUrl]);
        onWallpaperChange(dataUrl);
        toast.success('Custom image uploaded successfully!');
      }
    };

    reader.onerror = () => {
      toast.error('Failed to upload image', {
        description: 'There was an error reading the file.',
      });
    };

    reader.readAsDataURL(file);
    // Reset input so the same file can be selected again
    event.target.value = '';
  };

  const handleRemoveCustomImage = (imageUrl: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setCustomImages(prev => prev.filter(img => img !== imageUrl));
    // If the removed image was selected, clear selection
    if (selected === imageUrl) {
      onWallpaperChange(wallpaperPaths[0] || WALLPAPER_RELATIVE[0]);
    }
  };

  return (
    <div className="flex-[3] min-w-0 bg-black border border-white/10 rounded-xl p-6 flex flex-col h-full overflow-y-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-white">Zoom Level</span>
          {zoomEnabled && selectedZoomDepth && (
            <span className="text-xs uppercase tracking-wider font-medium text-white bg-white/10 px-3 py-1 rounded-full">
              {ZOOM_DEPTH_OPTIONS.find(o => o.depth === selectedZoomDepth)?.label} Active
            </span>
          )}
        </div>
        <div className="grid grid-cols-5 gap-3">
          {ZOOM_DEPTH_OPTIONS.map((option) => {
            const isActive = selectedZoomDepth === option.depth;
            return (
              <Button
                key={option.depth}
                type="button"
                disabled={!zoomEnabled}
                onClick={() => onZoomDepthChange?.(option.depth)}
                variant={isActive ? "default" : "outline"}
                className={cn(
                  "h-auto w-full rounded-lg px-1 py-3 flex flex-col items-center justify-center gap-1.5",
                  !isActive && "text-white/60"
                )}
              >
                <span className="text-sm font-semibold tracking-tight">{option.label}</span>
              </Button>
            );
          })}
        </div>
        {!zoomEnabled && (
          <p className="text-xs text-white/50 mt-4 text-center">Select a zoom region in the timeline to adjust depth.</p>
        )}
        {zoomEnabled && (
          <Button
            onClick={handleDeleteClick}
            variant="destructive"
            className="mt-4 w-full"
          >
            <Trash2 className="w-4 h-4" />
            Delete Zoom Region
          </Button>
        )}
      </div>

      <div className="mb-6 space-y-3">
        <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="text-sm font-medium text-white">Drop Shadow</div>
          <Switch
            checked={showShadow}
            onCheckedChange={onShadowChange}
            className="data-[state=checked]:bg-white"
          />
        </div>
        <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="text-sm font-medium text-white">Blur Background</div>
          <Switch
            checked={showBlur}
            onCheckedChange={onBlurChange}
            className="data-[state=checked]:bg-white"
          />
        </div>
      </div>

      <div className="mb-6">
        <Button
          onClick={() => setShowCropDropdown(!showCropDropdown)}
          variant="outline"
          className="w-full h-11"
        >
          <Crop className="w-4 h-4" />
          Crop Video
        </Button>
        <p className="text-xs text-white/50 text-center mt-3 leading-relaxed">
          If the preview looks weirdly positioned or doesn't load, try force reloading the app a few times till it works.
        </p>
      </div>
      
      {showCropDropdown && cropRegion && onCropChange && (
        <>
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={() => setShowCropDropdown(false)}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[60] bg-black rounded-xl shadow-2xl border border-white/10 p-6 w-[90vw] max-w-5xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-lg font-semibold text-white">Crop Video</span>
                <p className="text-sm text-white/50 mt-2">Drag on each side to adjust the crop area</p>
              </div>
              <Button
                onClick={() => setShowCropDropdown(false)}
                variant="ghost"
                size="icon"
                className="rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <CropControl
              videoElement={videoElement || null}
              cropRegion={cropRegion}
              onCropChange={onCropChange}
            />
            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => setShowCropDropdown(false)}
                variant="default"
                size="lg"
              >
                Done
              </Button>
            </div>
          </div>
        </>
      )}

      <Tabs defaultValue="image" className="flex-1 flex flex-col min-h-0">
        <TabsList className="mb-4 bg-white/5 border border-white/10 p-1 w-full grid grid-cols-3 h-auto rounded-lg">
          <TabsTrigger value="image" className="data-[state=active]:bg-white data-[state=active]:text-black text-white/60 py-2 rounded-md transition-all text-sm">Image</TabsTrigger>
          <TabsTrigger value="color" className="data-[state=active]:bg-white data-[state=active]:text-black text-white/60 py-2 rounded-md transition-all text-sm">Color</TabsTrigger>
          <TabsTrigger value="gradient" className="data-[state=active]:bg-white data-[state=active]:text-black text-white/60 py-2 rounded-md transition-all text-sm">Gradient</TabsTrigger>
        </TabsList>
        
        <div className="flex-1 min-h-0 overflow-y-auto">
          <TabsContent value="image" className="mt-0 space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept=".jpg,.jpeg,image/jpeg"
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full"
            >
              <Upload className="w-4 h-4" />
              Upload Custom Image
            </Button>

            <div className="grid grid-cols-6 gap-3">
              {customImages.map((imageUrl, idx) => {
                const isSelected = selected === imageUrl;
                return (
                  <div
                    key={`custom-${idx}`}
                    className={cn(
                      "aspect-square rounded-lg border-2 overflow-hidden cursor-pointer transition-all duration-200 relative group",
                      isSelected
                        ? "border-white scale-105"
                        : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 hover:scale-105 opacity-70 hover:opacity-100 transition-all"
                    )}
                    style={{ backgroundImage: `url(${imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}
                    aria-label={`Custom Image ${idx + 1}`}
                    onClick={() => onWallpaperChange(imageUrl)}
                    role="button"
                  >
                    <Button
                      onClick={(e) => handleRemoveCustomImage(imageUrl, e)}
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 w-5 h-5 bg-black/90 hover:bg-black/95 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10 p-0"
                      aria-label="Remove custom image"
                    >
                      <X className="w-3 h-3 text-white" />
                    </Button>
                  </div>
                );
              })}

              {(wallpaperPaths.length > 0 ? wallpaperPaths : WALLPAPER_RELATIVE.map(p => `/${p}`)).map((path, idx) => {
                const isSelected = (() => {
                  if (!selected) return false;
                  if (selected === path) return true;
                  try {
                    const clean = (s: string) => s.replace(/^file:\/\//, '').replace(/^\//, '')
                    if (clean(selected).endsWith(clean(path))) return true;
                    if (clean(path).endsWith(clean(selected))) return true;
                  } catch {
                  }
                  return false;
                })();

                return (
                  <div
                    key={path}
                    className={cn(
                      "aspect-square rounded-lg border-2 overflow-hidden cursor-pointer transition-all duration-200",
                      isSelected
                        ? "border-white scale-105"
                        : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 hover:scale-105 opacity-70 hover:opacity-100 transition-all"
                    )}
                    style={{ backgroundImage: `url(${path})`, backgroundSize: "cover", backgroundPosition: "center" }}
                    aria-label={`Wallpaper ${idx + 1}`}
                    onClick={() => onWallpaperChange(path)}
                    role="button"
                  />
                )
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="color" className="mt-0">
            <div className="p-1">
              <Colorful
                color={hsva}
                disableAlpha={true}
                onChange={(color) => {
                  setHsva(color.hsva);
                  onWallpaperChange(hsvaToHex(color.hsva));
                }}
                style={{ width: '100%', borderRadius: '12px' }}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="gradient" className="mt-0">
            <div className="grid grid-cols-6 gap-3">
              {GRADIENTS.map((g, idx) => (
                <div
                  key={g}
                  className={cn(
                    "aspect-square rounded-lg border-2 overflow-hidden cursor-pointer transition-all duration-200",
                    gradient === g 
                      ? "border-white scale-105" 
                      : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 hover:scale-105 opacity-70 hover:opacity-100 transition-all"
                  )}
                  style={{ background: g }}
                  aria-label={`Gradient ${idx + 1}`}
                  onClick={() => { setGradient(g); onWallpaperChange(g); }}
                  role="button"
                />
              ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>

      <div className="mt-6 pt-6 border-t border-white/10">
        <Button
          type="button"
          onClick={onExport}
          variant="default"
          size="lg"
          className="w-full"
        >
          <Download className="w-5 h-5" />
          <span>Export Video</span>
        </Button>
        <div className="flex gap-3 mt-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              window.electronAPI?.openExternalUrl('https://github.com/siddharthvaddem/openscreen/issues/new');
            }}
            className="flex-1 text-xs text-white/50 hover:text-white/80"
          >
            <Bug className="w-3 h-3" />
            <span>Report a Bug</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              window.electronAPI?.openExternalUrl('https://buymeacoffee.com/siddharthvaddem');
            }}
            className="flex-1 text-xs text-white/50 hover:text-white/80"
          >
            <Coffee className="w-3 h-3" />
            <span>Buy me a Coffee</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
