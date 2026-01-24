import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  RotateCcw, 
  Crop, 
  Type, 
  Sliders, 
  Download,
  Check,
  Sun,
  Contrast,
  Droplets,
  Palette,
  FlipHorizontal,
  FlipVertical,
  RotateCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

interface MediaEditorProps {
  imageUrl: string;
  onSave: (editedImageUrl: string) => void;
  onClose: () => void;
}

interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
}

const MediaEditor = ({ imageUrl, onSave, onClose }: MediaEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTab, setActiveTab] = useState<'adjust' | 'crop' | 'text'>('adjust');
  
  // Image adjustments
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [hue, setHue] = useState(0);
  
  // Transformations
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  
  // Text overlays
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [newText, setNewText] = useState("");
  const [textColor, setTextColor] = useState("#ffffff");
  const [fontSize, setFontSize] = useState(32);
  
  // Crop
  const [cropMode, setCropMode] = useState(false);
  const [cropAspect, setCropAspect] = useState<'free' | '1:1' | '16:9' | '9:16' | '4:5'>('free');
  
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setOriginalImage(img);
      renderCanvas(img);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    if (originalImage) {
      renderCanvas(originalImage);
    }
  }, [brightness, contrast, saturation, hue, rotation, flipH, flipV, textOverlays]);

  const renderCanvas = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = img.width;
    canvas.height = img.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context state
    ctx.save();

    // Apply transformations
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Apply filters
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) hue-rotate(${hue}deg)`;

    // Draw image
    ctx.drawImage(img, 0, 0);

    // Reset filter for text
    ctx.filter = 'none';

    // Restore context state for text (without rotation/flip)
    ctx.restore();

    // Draw text overlays
    textOverlays.forEach((overlay) => {
      ctx.font = `bold ${overlay.fontSize}px Inter, sans-serif`;
      ctx.fillStyle = overlay.color;
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.fillText(overlay.text, overlay.x, overlay.y);
    });
  };

  const handleAddText = () => {
    if (!newText.trim() || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const newOverlay: TextOverlay = {
      id: crypto.randomUUID(),
      text: newText,
      x: canvas.width / 2,
      y: canvas.height / 2,
      fontSize,
      color: textColor,
    };
    
    setTextOverlays([...textOverlays, newOverlay]);
    setNewText("");
  };

  const handleRemoveText = (id: string) => {
    setTextOverlays(textOverlays.filter((t) => t.id !== id));
  };

  const handleReset = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setHue(0);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setTextOverlays([]);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL('image/png', 1.0);
    onSave(dataUrl);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = 'edited-image.png';
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  };

  const aspectRatios = [
    { label: 'Livre', value: 'free' },
    { label: '1:1', value: '1:1' },
    { label: '16:9', value: '16:9' },
    { label: '9:16', value: '9:16' },
    { label: '4:5', value: '4:5' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
          <h2 className="text-lg font-semibold">Editor de Mídia</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Resetar
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Baixar
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Check className="w-4 h-4 mr-2" />
            Salvar
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Canvas Area */}
        <div className="flex-1 flex items-center justify-center p-8 bg-muted/30">
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            style={{ maxHeight: 'calc(100vh - 200px)' }}
          />
        </div>

        {/* Controls Sidebar */}
        <div className="w-80 border-l border-border bg-card overflow-y-auto">
          {/* Tabs */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab('adjust')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'adjust' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'
              }`}
            >
              <Sliders className="w-4 h-4 mx-auto mb-1" />
              Ajustes
            </button>
            <button
              onClick={() => setActiveTab('crop')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'crop' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'
              }`}
            >
              <Crop className="w-4 h-4 mx-auto mb-1" />
              Recortar
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'text' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'
              }`}
            >
              <Type className="w-4 h-4 mx-auto mb-1" />
              Texto
            </button>
          </div>

          <div className="p-4 space-y-6">
            <AnimatePresence mode="wait">
              {activeTab === 'adjust' && (
                <motion.div
                  key="adjust"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Brightness */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Brilho</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{brightness}%</span>
                    </div>
                    <Slider
                      value={[brightness]}
                      onValueChange={([v]) => setBrightness(v)}
                      min={0}
                      max={200}
                      step={1}
                    />
                  </div>

                  {/* Contrast */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Contrast className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Contraste</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{contrast}%</span>
                    </div>
                    <Slider
                      value={[contrast]}
                      onValueChange={([v]) => setContrast(v)}
                      min={0}
                      max={200}
                      step={1}
                    />
                  </div>

                  {/* Saturation */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Saturação</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{saturation}%</span>
                    </div>
                    <Slider
                      value={[saturation]}
                      onValueChange={([v]) => setSaturation(v)}
                      min={0}
                      max={200}
                      step={1}
                    />
                  </div>

                  {/* Hue */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Palette className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Matiz</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{hue}°</span>
                    </div>
                    <Slider
                      value={[hue]}
                      onValueChange={([v]) => setHue(v)}
                      min={-180}
                      max={180}
                      step={1}
                    />
                  </div>

                  {/* Transform */}
                  <div className="space-y-3">
                    <span className="text-sm font-medium">Transformar</span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRotation((r) => r - 90)}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRotation((r) => r + 90)}
                      >
                        <RotateCw className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={flipH ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFlipH(!flipH)}
                      >
                        <FlipHorizontal className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={flipV ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFlipV(!flipV)}
                      >
                        <FlipVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'crop' && (
                <motion.div
                  key="crop"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <span className="text-sm font-medium">Proporção</span>
                  <div className="grid grid-cols-3 gap-2">
                    {aspectRatios.map((ratio) => (
                      <Button
                        key={ratio.value}
                        variant={cropAspect === ratio.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCropAspect(ratio.value as any)}
                      >
                        {ratio.label}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Selecione uma proporção para recortar a imagem
                  </p>
                </motion.div>
              )}

              {activeTab === 'text' && (
                <motion.div
                  key="text"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Adicionar texto</label>
                    <Input
                      value={newText}
                      onChange={(e) => setNewText(e.target.value)}
                      placeholder="Digite o texto..."
                      maxLength={100}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm">Cor</label>
                      <Input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="h-10 p-1"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm">Tamanho</label>
                      <Input
                        type="number"
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        min={12}
                        max={200}
                      />
                    </div>
                  </div>

                  <Button onClick={handleAddText} disabled={!newText.trim()} className="w-full">
                    Adicionar Texto
                  </Button>

                  {textOverlays.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Textos adicionados</span>
                      {textOverlays.map((overlay) => (
                        <div
                          key={overlay.id}
                          className="flex items-center justify-between p-2 bg-muted rounded"
                        >
                          <span className="text-sm truncate">{overlay.text}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveText(overlay.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MediaEditor;
