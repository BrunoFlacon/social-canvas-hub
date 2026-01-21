import { motion } from "framer-motion";
import { Check, Plus, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { socialPlatforms } from "@/components/icons/SocialIcons";

interface SocialNetworkCardProps {
  platform: typeof socialPlatforms[number];
  isConnected: boolean;
  onToggle: () => void;
  delay?: number;
}

export const SocialNetworkCard = ({
  platform,
  isConnected,
  onToggle,
  delay = 0,
}: SocialNetworkCardProps) => {
  const Icon = platform.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "glass-card rounded-2xl p-5 border transition-all duration-300 cursor-pointer group",
        isConnected 
          ? "border-green-500/30 bg-green-500/5" 
          : "border-border hover:border-primary/30"
      )}
      onClick={onToggle}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
            platform.color
          )}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold">{platform.name}</h3>
            <p className="text-sm text-muted-foreground">
              {isConnected ? "Conectado" : "Clique para conectar"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isConnected && (
            <button
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="p-2 rounded-lg hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
            >
              <Settings className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center transition-all",
            isConnected 
              ? "bg-green-500 text-white" 
              : "bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground"
          )}>
            {isConnected ? (
              <Check className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
