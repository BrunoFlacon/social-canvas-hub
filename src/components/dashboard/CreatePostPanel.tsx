import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Image, 
  Video, 
  FileText, 
  Calendar, 
  Send, 
  Sparkles,
  Clock,
  Hash,
  Smartphone,
  Monitor,
  X,
  Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { socialPlatforms, SocialPlatformId } from "@/components/icons/SocialIcons";

type MediaType = "image" | "video" | "document" | "story" | "live";

const mediaTypes: { id: MediaType; icon: typeof Image; label: string }[] = [
  { id: "image", icon: Image, label: "Imagem" },
  { id: "video", icon: Video, label: "Vídeo" },
  { id: "document", icon: FileText, label: "Documento" },
  { id: "story", icon: Smartphone, label: "Story" },
  { id: "live", icon: Monitor, label: "Live" },
];

export const CreatePostPanel = () => {
  const [content, setContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatformId[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<MediaType | null>(null);
  const [orientation, setOrientation] = useState<"horizontal" | "vertical">("horizontal");
  const [scheduledDate, setScheduledDate] = useState<string>("");

  const togglePlatform = (id: SocialPlatformId) => {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const characterCount = content.length;
  const maxCharacters = 2000;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl border border-border overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl">Criar Publicação</h2>
              <p className="text-sm text-muted-foreground">
                Publique em múltiplas redes simultaneamente
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-sm font-medium",
              characterCount > maxCharacters ? "text-destructive" : "text-muted-foreground"
            )}>
              {characterCount}/{maxCharacters}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Platform Selection */}
        <div>
          <label className="text-sm font-medium mb-3 block">
            Selecionar Redes Sociais
          </label>
          <div className="flex flex-wrap gap-2">
            {socialPlatforms.map((platform) => {
              const Icon = platform.icon;
              const isSelected = selectedPlatforms.includes(platform.id);
              return (
                <motion.button
                  key={platform.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => togglePlatform(platform.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all",
                    isSelected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50 text-muted-foreground"
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-md flex items-center justify-center",
                    platform.color
                  )}>
                    <Icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-sm font-medium">{platform.name}</span>
                  {isSelected && (
                    <X className="w-3 h-3" />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Media Type Selection */}
        <div>
          <label className="text-sm font-medium mb-3 block">
            Tipo de Mídia
          </label>
          <div className="flex flex-wrap gap-2">
            {mediaTypes.map((type) => (
              <motion.button
                key={type.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedMedia(selectedMedia === type.id ? null : type.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all",
                  selectedMedia === type.id
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border hover:border-accent/50 text-muted-foreground"
                )}
              >
                <type.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{type.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Orientation (for video) */}
        <AnimatePresence>
          {selectedMedia === "video" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label className="text-sm font-medium mb-3 block">
                Orientação do Vídeo
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setOrientation("horizontal")}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all",
                    orientation === "horizontal"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50 text-muted-foreground"
                  )}
                >
                  <div className="w-6 h-4 border-2 border-current rounded" />
                  <span className="text-sm font-medium">Horizontal</span>
                </button>
                <button
                  onClick={() => setOrientation("vertical")}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all",
                    orientation === "vertical"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50 text-muted-foreground"
                  )}
                >
                  <div className="w-4 h-6 border-2 border-current rounded" />
                  <span className="text-sm font-medium">Vertical</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Area */}
        <AnimatePresence>
          {selectedMedia && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer group">
                <div className="w-16 h-16 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="font-medium mb-1">
                  Arraste e solte ou clique para fazer upload
                </p>
                <p className="text-sm text-muted-foreground">
                  Suporta: JPG, PNG, GIF, MP4, PDF, DOCX
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Textarea */}
        <div>
          <label className="text-sm font-medium mb-3 block">
            Conteúdo da Publicação
          </label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Escreva sua mensagem aqui... Use #hashtags para maior alcance"
            className="min-h-[150px] bg-muted/50 border-border focus:border-primary resize-none"
          />
          <div className="flex items-center gap-2 mt-3">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Hash className="w-4 h-4" />
              Hashtags
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Sparkles className="w-4 h-4" />
              Gerar com IA
            </button>
          </div>
        </div>

        {/* Schedule */}
        <div>
          <label className="text-sm font-medium mb-3 block">
            Agendamento
          </label>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full bg-muted/50 border border-border rounded-xl px-10 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border hover:border-primary/50 text-muted-foreground hover:text-foreground transition-colors">
              <Clock className="w-4 h-4" />
              Melhor Horário
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 border-t border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {selectedPlatforms.length} redes selecionadas
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="border-border">
              Salvar Rascunho
            </Button>
            <Button 
              disabled={!content || selectedPlatforms.length === 0}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground gap-2"
            >
              <Send className="w-4 h-4" />
              {scheduledDate ? "Agendar" : "Publicar Agora"}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
