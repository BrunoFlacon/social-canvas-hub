import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { 
  FileText, Upload, Download, Eye, Trash2, File, FileImage, FileVideo, FileType, Loader2, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DocumentItem {
  id: string;
  user_id: string;
  name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  downloads: number;
  created_at: string;
}

const getFileIcon = (type: string) => {
  switch (type) {
    case "pdf": return FileType;
    case "video": return FileVideo;
    case "image": return FileImage;
    default: return File;
  }
};

const getFileColor = (type: string) => {
  switch (type) {
    case "pdf": return "bg-red-500/10 text-red-500";
    case "video": return "bg-purple-500/10 text-purple-500";
    case "image": return "bg-green-500/10 text-green-500";
    case "excel": return "bg-emerald-500/10 text-emerald-500";
    default: return "bg-blue-500/10 text-blue-500";
  }
};

const detectFileType = (name: string): string => {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  if (["pdf"].includes(ext)) return "pdf";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return "image";
  if (["mp4", "mov", "avi", "webm"].includes(ext)) return "video";
  if (["xls", "xlsx", "csv"].includes(ext)) return "excel";
  return "other";
};

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const DocumentsView = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocs = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (!error && data) setDocs(data as unknown as DocumentItem[]);
    setLoading(false);
  };

  useEffect(() => { fetchDocs(); }, [user]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("documents-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "documents", filter: `user_id=eq.${user.id}` }, () => fetchDocs())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `documents/${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("media").upload(path, file);
      if (uploadError) {
        toast({ title: "Erro no upload", description: uploadError.message, variant: "destructive" });
        continue;
      }
      const { data: urlData } = supabase.storage.from("media").getPublicUrl(path);
      await supabase.from("documents").insert({
        user_id: user.id,
        name: file.name,
        file_url: urlData.publicUrl,
        file_type: detectFileType(file.name),
        file_size: file.size,
      } as any);
    }

    toast({ title: "Upload concluído!" });
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDownload = async (doc: DocumentItem) => {
    // Increment downloads
    await supabase.from("documents").update({ downloads: doc.downloads + 1 } as any).eq("id", doc.id);
    window.open(doc.file_url, "_blank");
  };

  const handleDelete = async (id: string) => {
    await supabase.from("documents").delete().eq("id", id);
    toast({ title: "Documento removido" });
  };

  const handlePreview = (doc: DocumentItem) => {
    window.open(doc.file_url, "_blank");
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (!user) return;
    const files = e.dataTransfer.files;
    if (!files.length) return;

    setUploading(true);
    for (const file of Array.from(files)) {
      const path = `documents/${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("media").upload(path, file);
      if (uploadError) continue;
      const { data: urlData } = supabase.storage.from("media").getPublicUrl(path);
      await supabase.from("documents").insert({
        user_id: user.id,
        name: file.name,
        file_url: urlData.publicUrl,
        file_type: detectFileType(file.name),
        file_size: file.size,
      } as any);
    }
    toast({ title: "Upload concluído!" });
    setUploading(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl mb-2">Documentos</h1>
        <p className="text-muted-foreground">Gerencie arquivos e documentos para suas publicações</p>
      </div>

      <input ref={fileInputRef} type="file" multiple onChange={handleUpload} className="hidden" />

      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-2xl border-2 border-dashed border-border p-8 mb-8 hover:border-primary/50 transition-colors cursor-pointer group"
        onClick={() => !uploading && fileInputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            {uploading ? (
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            ) : (
              <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
            )}
          </div>
          <p className="font-medium mb-1">
            {uploading ? "Enviando..." : "Arraste arquivos ou clique para fazer upload"}
          </p>
          <p className="text-sm text-muted-foreground">Suporta PDF, DOCX, XLSX, imagens, vídeos e mais</p>
          {!uploading && (
            <Button className="mt-4" variant="outline">Selecionar Arquivos</Button>
          )}
        </div>
      </motion.div>

      {/* Documents List */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="glass-card rounded-2xl border border-border overflow-hidden"
      >
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-xl">Arquivos ({docs.length})</h2>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : docs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mb-3 opacity-50" />
            <p className="font-medium">Nenhum documento</p>
            <p className="text-sm text-muted-foreground mt-1">Faça upload dos seus primeiros arquivos</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {docs.map((doc, index) => {
              const Icon = getFileIcon(doc.file_type);
              const colorClass = getFileColor(doc.file_type);
              return (
                <motion.div key={doc.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * index }}
                  className="p-4 hover:bg-muted/30 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", colorClass)}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{doc.name}</p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span>{formatSize(doc.file_size)}</span>
                        <span>•</span>
                        <span>{new Date(doc.created_at).toLocaleDateString("pt-BR")}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Download className="w-3 h-3" />{doc.downloads} downloads</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handlePreview(doc)} className="p-2 rounded-lg hover:bg-muted transition-colors">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button onClick={() => handleDownload(doc)} className="p-2 rounded-lg hover:bg-muted transition-colors">
                        <Download className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button onClick={() => handleDelete(doc.id)} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
