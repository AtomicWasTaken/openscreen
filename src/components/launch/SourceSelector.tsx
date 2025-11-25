import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { MdCheck } from "react-icons/md";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card } from "../ui/card";
import { cn } from "@/lib/utils";

interface DesktopSource {
  id: string;
  name: string;
  thumbnail: string | null;
  display_id: string;
  appIcon: string | null;
}

export function SourceSelector() {
  const [sources, setSources] = useState<DesktopSource[]>([]);
  const [selectedSource, setSelectedSource] = useState<DesktopSource | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSources() {
      setLoading(true);
      try {
        const rawSources = await window.electronAPI.getSources({
          types: ['screen', 'window'],
          thumbnailSize: { width: 320, height: 180 },
          fetchWindowIcons: true
        });
        setSources(
          rawSources.map(source => ({
            id: source.id,
            name:
              source.id.startsWith('window:') && source.name.includes(' — ')
                ? source.name.split(' — ')[1] || source.name
                : source.name,
            thumbnail: source.thumbnail,
            display_id: source.display_id,
            appIcon: source.appIcon
          }))
        );
      } catch (error) {
        console.error('Error loading sources:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchSources();
  }, []);

  const screenSources = sources.filter(s => s.id.startsWith('screen:'));
  const windowSources = sources.filter(s => s.id.startsWith('window:'));

  const handleSourceSelect = (source: DesktopSource) => setSelectedSource(source);
  const handleShare = async () => {
    if (selectedSource) await window.electronAPI.selectSource(selectedSource);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-black/90 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 p-6" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/20 border-t-white mx-auto mb-2" />
          <p className="text-xs text-white/70">Loading sources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 p-6">
      <div className="flex-1 flex flex-col w-full max-w-xl min-w-0">
        <Tabs defaultValue="screens">
          <TabsList className="mb-4 bg-white/5 border border-white/10 p-1 w-full grid grid-cols-2 h-auto rounded-lg">
            <TabsTrigger value="screens" className="data-[state=active]:bg-white data-[state=active]:text-black text-white/60 py-2 rounded-md transition-all text-sm w-full">Screens</TabsTrigger>
            <TabsTrigger value="windows" className="data-[state=active]:bg-white data-[state=active]:text-black text-white/60 py-2 rounded-md transition-all text-sm w-full">Windows</TabsTrigger>
          </TabsList>
            <div className="h-60 flex flex-col justify-stretch">
            <TabsContent value="screens" className="h-full">
              <div className="grid grid-cols-2 gap-4 h-full overflow-y-auto relative">
                {screenSources.map(source => (
                  <Card
                    key={source.id}
                    className={cn(
                      "cursor-pointer h-fit p-2 rounded-lg border transition-all",
                      selectedSource?.id === source.id 
                        ? 'border-white bg-white/10' 
                        : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                    )}
                    style={{ margin: 0, width: '100%' }}
                    onClick={() => handleSourceSelect(source)}
                  >
                    <div className="p-2">
                      <div className="relative mb-3">
                        <img
                          src={source.thumbnail || ''}
                          alt={source.name}
                          className="w-full aspect-video object-cover rounded-lg border border-white/10"
                        />
                        {selectedSource?.id === source.id && (
                          <div className="absolute -top-1 -right-1">
                            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-black">
                              <MdCheck className="w-3 h-3 text-black" />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-sm font-medium text-white truncate min-w-0">{source.name}</div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="windows" className="h-full">
              <div className="grid grid-cols-2 gap-4 h-full overflow-y-auto relative">
                {windowSources.map(source => (
                  <Card
                    key={source.id}
                    className={cn(
                      "cursor-pointer h-fit p-2 rounded-lg border transition-all",
                      selectedSource?.id === source.id 
                        ? 'border-white bg-white/10' 
                        : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                    )}
                    style={{ margin: 0, width: '100%' }}
                    onClick={() => handleSourceSelect(source)}
                  >
                    <div className="p-2">
                      <div className="relative mb-3">
                        <img
                          src={source.thumbnail || ''}
                          alt={source.name}
                          className="w-full aspect-video object-cover rounded-lg border border-white/10"
                        />
                        {selectedSource?.id === source.id && (
                          <div className="absolute -top-1 -right-1">
                            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-black">
                              <MdCheck className="w-3 h-3 text-black" />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        {source.appIcon && (
                          <img
                            src={source.appIcon}
                            alt="App icon"
                            className="w-4 h-4 flex-shrink-0"
                          />
                        )}
                        <div className="text-sm font-medium text-white truncate min-w-0">{source.name}</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
      <div className="border-t border-white/10 pt-6 w-full max-w-xl">
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => window.close()} size="default">Cancel</Button>
          <Button onClick={handleShare} disabled={!selectedSource} variant="default" size="default">Share</Button>
        </div>
      </div>
    </div>
  );
}
