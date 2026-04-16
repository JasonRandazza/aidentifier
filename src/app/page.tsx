"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, Image as ImageIcon, Loader2, ScanLine } from "lucide-react";

interface IdentifiedObject {
  label: string;
  score: number;
  box: {
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
  };
}

export default function Home() {
  const [theFile, setTheFile] = useState<File | undefined>(undefined);
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<IdentifiedObject[]>([]);
  const [activeLabels, setActiveLabels] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;

    setTheFile(file);
    const blobUrl = URL.createObjectURL(file);
    setImagePreview(blobUrl);
    setApiResponse([]);
    setActiveLabels(new Set());
    setNaturalSize(null);
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setNaturalSize({
      width: img.naturalWidth,
      height: img.naturalHeight,
    });
  };

  const identifyThings = async () => {
    if (!theFile) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.set("theImage", theFile);

    try {
      // The API route endpoint
      const response = await fetch("/api", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const theResponse = await response.json();
        const objects = Array.isArray(theResponse.body) ? theResponse.body : [];
        setApiResponse(objects);
        
        const labels = new Set(objects.map((obj: IdentifiedObject) => obj.label));
        setActiveLabels(labels as Set<string>);
      } else {
        console.error("API Error", await response.text());
        alert("Failed to identify objects. Check console.");
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
    setIsLoading(false);
  };

  const toggleLabel = (label: string) => {
    setActiveLabels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(label)) newSet.delete(label);
      else newSet.add(label);
      return newSet;
    });
  };

  const uniqueLabels = Array.from(new Set(apiResponse.map(o => o.label)));

  const getColorForLabel = (label: string) => {
    let hash = 0;
    for (let i = 0; i < label.length; i++) {
        hash = label.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 80%, 65%)`;
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-start p-6 md:p-12 lg:p-24 font-sans selection:bg-neon-blue/30 text-zinc-100">
      
      {/* HEADER */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center justify-center space-x-3 mb-4">
          <ScanLine className="w-10 h-10 text-[var(--color-neon-blue)]" />
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-[var(--color-neon-blue)] to-[var(--color-neon-purple)] bg-clip-text text-transparent">
            AI-dentifier
          </h1>
        </div>
        <p className="text-zinc-400 max-w-xl mx-auto text-lg pt-4">
          Powered by Facebook&apos;s DEtection TRansformer (DETR). Upload any image to instantly detect and localize objects using sophisticated computer vision.
        </p>
      </motion.div>

      {/* WORKSPACE */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* LEFT PANEL - PREVIEW & UPLOAD */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          <div className="relative group bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 p-2 md:p-4 rounded-3xl shadow-2xl overflow-hidden min-h-[500px] flex items-center justify-center transition-all h-full">
            
            {/* Empty State */}
            {!imagePreview && (
              <div 
                className="absolute inset-0 flex flex-col items-center justify-center border-2 border-dashed border-zinc-700/50 m-4 rounded-2xl cursor-pointer hover:border-[var(--color-neon-blue)]/50 transition-colors hover:bg-white/[0.02]"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="bg-zinc-800 p-5 pl-6  rounded-full mb-4 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-10 h-10 text-zinc-400 group-hover:text-[var(--color-neon-blue)] transition-colors" />
                </div>
                <p className="text-2xl font-medium text-zinc-300">Click to upload image</p>
                <p className="text-md text-zinc-500 mt-2">JPG, PNG or WEBP from your desktop</p>
              </div>
            )}

            {/* Image display */}
            {imagePreview && (
              <div className="relative w-full h-full flex flex-col items-center justify-center bg-zinc-950/50 rounded-2xl overflow-hidden p-4">
                
                <div className="relative inline-flex items-center justify-center max-w-full max-h-[65vh]">
                  <img 
                    src={imagePreview} 
                    onLoad={onImageLoad}
                    className="max-w-full max-h-[65vh] object-contain rounded-lg shadow-2xl block relative z-10"
                    alt="Preview"
                  />
                  
                  {/* Bounding Box Overlay exactly fitting the Image bounds */}
                  <div className="absolute inset-0 z-20 pointer-events-none">
                    <AnimatePresence>
                      {naturalSize && apiResponse.map((obj, idx) => {
                        if (!activeLabels.has(obj.label)) return null;

                        const left = (obj.box.xmin / naturalSize.width) * 100;
                        const top = (obj.box.ymin / naturalSize.height) * 100;
                        const width = ((obj.box.xmax - obj.box.xmin) / naturalSize.width) * 100;
                        const height = ((obj.box.ymax - obj.box.ymin) / naturalSize.height) * 100;
                        const color = getColorForLabel(obj.label);

                        return (
                          <motion.div
                            key={`${idx}-${obj.label}`}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3, delay: idx * 0.05 }}
                            className="absolute pointer-events-none"
                            style={{
                              left: `${left}%`,
                              top: `${top}%`,
                              width: `${width}%`,
                              height: `${height}%`,
                              border: `3px solid ${color}`,
                              boxShadow: `0 0 15px -3px ${color}80, inset 0 0 10px -3px ${color}60` 
                            }}
                          >
                            <div 
                              className="absolute -top-[28px] left-[-3px] px-2 py-0.5 text-xs font-bold text-zinc-950 rounded-t-md whitespace-nowrap backdrop-blur-md flex items-center justify-center"
                              style={{ height: "28px", backgroundColor: color }}
                            >
                              {obj.label.toUpperCase()} {Math.round(obj.score * 100)}%
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Change Image Button */}
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-4 right-4 z-30 bg-zinc-900/80 hover:bg-zinc-800 text-white p-3 md:px-5 md:py-2.5 rounded-full backdrop-blur-md border border-zinc-700 shadow-xl flex items-center space-x-2 transition-all hover:border-[var(--color-neon-blue)]/50 focus:outline-none"
                >
                  <ImageIcon className="w-5 h-5" />
                  <span className="hidden md:inline font-medium text-sm">Change Image</span>
                </button>
              </div>
            )}
            
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              accept="image/*"
            />
          </div>
        </div>

        {/* RIGHT PANEL - CONTROLS & RESULTS */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 p-6 rounded-3xl shadow-xl flex flex-col h-full min-h-[400px]">
             
             <h2 className="text-2xl font-semibold mb-6 flex items-center space-x-2 text-zinc-100">
                <span>Detection Control</span>
             </h2>

             {!imagePreview ? (
               <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 space-y-4">
                 <UploadCloud className="w-12 h-12 opacity-30" />
                 <p className="text-center text-sm px-4">Waiting for image upload...</p>
               </div>
             ) : (
               <div className="flex flex-col flex-1">
                 <button
                    onClick={identifyThings}
                    disabled={isLoading || !theFile}
                    className="w-full relative group overflow-hidden bg-zinc-100 text-zinc-900 font-bold text-lg py-4 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed transition-all duration-300 transform active:scale-[0.98]"
                 >
                   <span className="relative z-10 flex items-center justify-center space-x-2">
                     {isLoading ? (
                       <>
                         <Loader2 className="w-6 h-6 animate-spin" />
                         <span>Analyzing...</span>
                       </>
                     ) : (
                       <>
                         <ScanLine className="w-6 h-6" />
                         <span>Analyze Image</span>
                       </>
                     )}
                   </span>
                 </button>

                 {/* Results Area */}
                 <div className="mt-8 flex-1">
                    {apiResponse.length > 0 ? (
                      <div>
                        <div className="flex justify-between items-center border-b border-zinc-800 mb-4 pb-2">
                          <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                            Identified Objects ({apiResponse.length})
                          </h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {uniqueLabels.map((lbl) => {
                            const isActive = activeLabels.has(lbl);
                            const color = getColorForLabel(lbl);
                            const count = apiResponse.filter(o => o.label === lbl).length;
                            
                            return (
                              <button
                                key={lbl}
                                onClick={() => toggleLabel(lbl)}
                                className="px-3 py-1.5 rounded-full text-sm font-medium border transition-colors flex items-center space-x-2 focus:outline-none"
                                style={{
                                  borderColor: isActive ? color : '#3f3f46',
                                  backgroundColor: isActive ? `${color}1A` : 'transparent',
                                  color: isActive ? color : '#a1a1aa'
                                }}
                              >
                                <span>{lbl}</span>
                                <span 
                                  className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                                  style={{ backgroundColor: isActive ? `${color}40` : '#27272a' }}
                                >
                                  {count}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      !isLoading && apiResponse.length === 0 && imagePreview ? (
                        <div className="h-full flex-1 flex flex-col items-center justify-center text-zinc-500 space-y-3 mt-12 pb-12">
                          <ScanLine className="w-8 h-8 opacity-20" />
                          <p className="text-center text-sm">Hit analyze image to scan for objects.</p>
                        </div>
                      ) : null
                    )}
                 </div>
               </div>
             )}
          </div>
        </div>
      </div>
    </main>
  );
}