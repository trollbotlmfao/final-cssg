"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { 
  SunIcon, 
  RotateCcwIcon, 
  DropletIcon, 
  SunMoonIcon,
  ContrastIcon
} from "lucide-react";

interface ImageEditorProps {
  imageUrl: string;
  onSave: (editedImageBlob: Blob) => void;
  onCancel: () => void;
}

export default function ImageEditor({ 
  imageUrl, 
  onSave, 
  onCancel 
}: ImageEditorProps) {
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const filters = [
    { name: "Normal", filter: {} },
    { name: "Clarendon", filter: { saturate: 1.3, contrast: 1.2, brightness: 1.1 } },
    { name: "Gingham", filter: { sepia: 0.1, contrast: 0.9, brightness: 1.1 } },
    { name: "Moon", filter: { grayscale: 0.8, brightness: 1.2, contrast: 1.1 } },
    { name: "Lark", filter: { brightness: 1.2, contrast: 0.9, saturate: 1.1 } },
    { name: "Reyes", filter: { sepia: 0.3, brightness: 1.1, contrast: 0.8, saturate: 0.9 } },
    { name: "Juno", filter: { saturate: 1.4, contrast: 1.1, brightness: 1.05 } },
    { name: "Slumber", filter: { brightness: 0.9, saturate: 0.8, sepia: 0.2 } }
  ];

  useEffect(() => {
    // Create a new image element
    const img = document.createElement('img');
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
      imageRef.current = img;
      renderImage();
    };
  }, [imageUrl]);

  useEffect(() => {
    renderImage();
  }, [brightness, contrast, saturation, blur, selectedFilter]);

  const renderImage = () => {
    if (!canvasRef.current || !imageRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Set canvas dimensions to match image
    canvas.width = imageRef.current.width;
    canvas.height = imageRef.current.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply filter settings
    let filterString = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    if (blur > 0) {
      filterString += ` blur(${blur}px)`;
    }
    
    // Apply Instagram-like filter if selected
    if (selectedFilter && selectedFilter !== "Normal") {
      const filter = filters.find(f => f.name === selectedFilter)?.filter;
      if (filter) {
        if (filter.grayscale) filterString += ` grayscale(${filter.grayscale})`;
        if (filter.sepia) filterString += ` sepia(${filter.sepia})`;
        if (filter.brightness) filterString += ` brightness(${filter.brightness * 100}%)`;
        if (filter.contrast) filterString += ` contrast(${filter.contrast * 100}%)`;
        if (filter.saturate) filterString += ` saturate(${filter.saturate * 100}%)`;
      }
    }
    
    ctx.filter = filterString;
    
    // Draw image with filters applied
    ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);
  };

  const handleSave = () => {
    if (!canvasRef.current) return;
    
    canvasRef.current.toBlob((blob) => {
      if (blob) {
        onSave(blob);
      }
    }, "image/jpeg", 0.9);
  };

  const resetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setBlur(0);
    setSelectedFilter(null);
  };

  // Create CSS filter string for preview thumbnails
  const getFilterStyle = (filter: any) => {
    let style = "";
    if (filter.grayscale) style += ` grayscale(${filter.grayscale})`;
    if (filter.sepia) style += ` sepia(${filter.sepia})`;
    if (filter.brightness) style += ` brightness(${filter.brightness * 100}%)`;
    if (filter.contrast) style += ` contrast(${filter.contrast * 100}%)`;
    if (filter.saturate) style += ` saturate(${filter.saturate * 100}%)`;
    return style;
  };

  return (
    <div className="space-y-4">
      <div className="relative aspect-square w-full overflow-hidden rounded-md bg-black">
        <canvas 
          ref={canvasRef} 
          className="absolute h-full w-full object-contain"
        />
        {/* Invisible canvas that will be used for rendering */}
      </div>
      
      <div className="flex overflow-x-auto gap-3 pb-2">
        {filters.map((filter) => (
          <button
            key={filter.name}
            onClick={() => setSelectedFilter(filter.name)}
            className={`flex flex-col items-center min-w-16 p-2 rounded ${
              selectedFilter === filter.name ? "bg-primary/10 border border-primary" : "hover:bg-muted/50"
            }`}
          >
            <div className="h-16 w-16 overflow-hidden rounded-md bg-muted mb-1 relative">
              {imageRef.current && (
                <div 
                  className="h-full w-full overflow-hidden"
                  style={{ 
                    backgroundImage: `url(${imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: getFilterStyle(filter.filter)
                  }}
                />
              )}
            </div>
            <span className="text-xs">{filter.name}</span>
          </button>
        ))}
      </div>
      
      <div className="space-y-3 bg-muted/20 p-3 rounded-md">
        <div className="flex items-center gap-3">
          <SunIcon size={18} />
          <span className="text-sm min-w-20">Brightness</span>
          <input 
            type="range"
            min="0"
            max="200"
            step="1"
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            className="flex-1 accent-primary"
          />
          <span className="text-xs w-8">{brightness}%</span>
        </div>
        
        <div className="flex items-center gap-3">
          <ContrastIcon size={18} />
          <span className="text-sm min-w-20">Contrast</span>
          <input 
            type="range"
            min="0"
            max="200"
            step="1"
            value={contrast}
            onChange={(e) => setContrast(Number(e.target.value))}
            className="flex-1 accent-primary"
          />
          <span className="text-xs w-8">{contrast}%</span>
        </div>
        
        <div className="flex items-center gap-3">
          <SunMoonIcon size={18} />
          <span className="text-sm min-w-20">Saturation</span>
          <input 
            type="range"
            min="0"
            max="200"
            step="1"
            value={saturation}
            onChange={(e) => setSaturation(Number(e.target.value))}
            className="flex-1 accent-primary"
          />
          <span className="text-xs w-8">{saturation}%</span>
        </div>
        
        <div className="flex items-center gap-3">
          <DropletIcon size={18} />
          <span className="text-sm min-w-20">Blur</span>
          <input 
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={blur}
            onChange={(e) => setBlur(Number(e.target.value))}
            className="flex-1 accent-primary"
          />
          <span className="text-xs w-8">{blur.toFixed(1)}px</span>
        </div>
      </div>
      
      <div className="flex justify-between gap-3">
        <Button variant="outline" onClick={resetFilters} type="button" className="flex gap-1 items-center">
          <RotateCcwIcon size={16} /> Reset
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} type="button">Cancel</Button>
          <Button onClick={handleSave} type="button">Apply</Button>
        </div>
      </div>
    </div>
  );
} 