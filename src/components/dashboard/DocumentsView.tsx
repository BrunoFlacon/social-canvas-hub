import { motion } from "framer-motion";
import { 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Trash2, 
  MoreHorizontal,
  File,
  FileImage,
  FileVideo,
  FileType
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const mockDocuments = [
  {
    id: "1",
    name: "Guia de Marca 2024.pdf",
    type: "pdf",
    size: "2.4 MB",
    uploadedAt: "15 Jan 2024",
    downloads: 45
  },
  {
    id: "2",
    name: "Calendário Editorial Q1.xlsx",
    type: "excel",
    size: "156 KB",
    uploadedAt: "12 Jan 2024",
    downloads: 23
  },
  {
    id: "3",
    name: "Assets de Campanha.zip",
    type: "archive",
    size: "45.8 MB",
    uploadedAt: "10 Jan 2024",
    downloads: 12
  },
  {
    id: "4",
    name: "Video Institucional.mp4",
    type: "video",
    size: "128 MB",
    uploadedAt: "8 Jan 2024",
    downloads: 8
  },
  {
    id: "5",
    name: "Fotos de Produto.zip",
    type: "image",
    size: "89.2 MB",
    uploadedAt: "5 Jan 2024",
    downloads: 34
  },
];

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

export const DocumentsView = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl mb-2">Documentos</h1>
        <p className="text-muted-foreground">
          Gerencie arquivos e documentos para suas publicações
        </p>
      </div>

      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-2xl border-2 border-dashed border-border p-8 mb-8 hover:border-primary/50 transition-colors cursor-pointer group"
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <p className="font-medium mb-1">
            Arraste arquivos ou clique para fazer upload
          </p>
          <p className="text-sm text-muted-foreground">
            Suporta PDF, DOCX, XLSX, imagens, vídeos e mais
          </p>
          <Button className="mt-4" variant="outline">
            Selecionar Arquivos
          </Button>
        </div>
      </motion.div>

      {/* Documents List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-2xl border border-border overflow-hidden"
      >
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-xl">Arquivos Recentes</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Todos os arquivos
              </Button>
            </div>
          </div>
        </div>

        <div className="divide-y divide-border">
          {mockDocuments.map((doc, index) => {
            const Icon = getFileIcon(doc.type);
            const colorClass = getFileColor(doc.type);
            
            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="p-4 hover:bg-muted/30 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    colorClass
                  )}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{doc.name}</p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>{doc.size}</span>
                      <span>•</span>
                      <span>{doc.uploadedAt}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        {doc.downloads} downloads
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                      <Download className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-destructive/10 transition-colors">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                      <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
};
