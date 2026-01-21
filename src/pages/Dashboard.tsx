import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Eye, 
  Heart, 
  Users, 
  TrendingUp 
} from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { CreatePostPanel } from "@/components/dashboard/CreatePostPanel";
import { RecentPosts } from "@/components/dashboard/RecentPosts";
import { AnalyticsChart } from "@/components/dashboard/AnalyticsChart";
import { SocialNetworkCard } from "@/components/dashboard/SocialNetworkCard";
import { CalendarView } from "@/components/dashboard/CalendarView";
import { StoriesLivesView } from "@/components/dashboard/StoriesLivesView";
import { DocumentsView } from "@/components/dashboard/DocumentsView";
import { SettingsView } from "@/components/dashboard/SettingsView";
import { MediaGalleryView } from "@/components/dashboard/MediaGalleryView";
import { NotificationsPanel } from "@/components/dashboard/NotificationsPanel";
import { socialPlatforms, SocialPlatformId } from "@/components/icons/SocialIcons";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [connectedPlatforms, setConnectedPlatforms] = useState<SocialPlatformId[]>([
    "facebook", "instagram", "linkedin"
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  const toggleConnection = (id: SocialPlatformId) => {
    setConnectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "create":
        return (
          <div className="max-w-4xl mx-auto">
            <CreatePostPanel />
          </div>
        );

      case "networks":
        return (
          <div>
            <div className="mb-8">
              <h1 className="font-display font-bold text-3xl mb-2">Redes Sociais</h1>
              <p className="text-muted-foreground">
                Conecte e gerencie suas redes sociais para publicação integrada
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {socialPlatforms.map((platform, index) => (
                <SocialNetworkCard
                  key={platform.id}
                  platform={platform}
                  isConnected={connectedPlatforms.includes(platform.id)}
                  onToggle={() => toggleConnection(platform.id)}
                  delay={index * 0.05}
                />
              ))}
            </div>
          </div>
        );

      case "analytics":
        return (
          <div>
            <div className="mb-8">
              <h1 className="font-display font-bold text-3xl mb-2">Analytics</h1>
              <p className="text-muted-foreground">
                Acompanhe o desempenho de suas publicações em tempo real
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatsCard
                title="Total de Views"
                value="1.2M"
                icon={Eye}
                trend={12.5}
                trendLabel="vs semana anterior"
                color="primary"
              />
              <StatsCard
                title="Engajamento"
                value="89.5K"
                icon={Heart}
                trend={8.2}
                trendLabel="vs semana anterior"
                color="accent"
              />
              <StatsCard
                title="Novos Seguidores"
                value="5.2K"
                icon={Users}
                trend={-2.1}
                trendLabel="vs semana anterior"
                color="success"
              />
              <StatsCard
                title="Taxa de Conversão"
                value="3.8%"
                icon={TrendingUp}
                trend={15.3}
                trendLabel="vs semana anterior"
                color="warning"
              />
            </div>
            <AnalyticsChart />
          </div>
        );

      case "calendar":
        return <CalendarView />;

      case "stories":
        return <StoriesLivesView />;

      case "documents":
        return <DocumentsView />;

      case "settings":
        return <SettingsView />;

      case "media":
        return <MediaGalleryView />;

      case "notifications":
        return (
          <div>
            <h1 className="font-display font-bold text-3xl mb-2">Notificações</h1>
            <p className="text-muted-foreground mb-6">Veja todas as suas notificações</p>
          </div>
        );

      default:
        return (
          <>
            <div className="mb-8">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display font-bold text-3xl mb-2"
              >
                Bem-vindo de volta! 👋
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-muted-foreground"
              >
                Gerencie todas as suas redes sociais em um único lugar
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatsCard
                title="Total de Posts"
                value="248"
                icon={TrendingUp}
                trend={12.5}
                trendLabel="este mês"
                color="primary"
                delay={0}
              />
              <StatsCard
                title="Visualizações"
                value="1.2M"
                icon={Eye}
                trend={8.2}
                trendLabel="vs mês anterior"
                color="accent"
                delay={0.1}
              />
              <StatsCard
                title="Engajamento"
                value="89.5K"
                icon={Heart}
                trend={-2.1}
                trendLabel="vs mês anterior"
                color="success"
                delay={0.2}
              />
              <StatsCard
                title="Seguidores"
                value="52.3K"
                icon={Users}
                trend={15.3}
                trendLabel="este mês"
                color="warning"
                delay={0.3}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <AnalyticsChart />
              </div>
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="glass-card rounded-2xl border border-border p-6"
                >
                  <h3 className="font-display font-bold text-lg mb-4">Redes Conectadas</h3>
                  <div className="space-y-3">
                    {socialPlatforms.slice(0, 5).map((platform) => {
                      const Icon = platform.icon;
                      const isConnected = connectedPlatforms.includes(platform.id);
                      return (
                        <div
                          key={platform.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center",
                              platform.color
                            )}>
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-sm font-medium">{platform.name}</span>
                          </div>
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            isConnected ? "bg-green-500" : "bg-muted-foreground"
                          )} />
                        </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setActiveTab("networks")}
                    className="w-full mt-4 text-sm text-primary hover:underline"
                  >
                    Ver todas as redes →
                  </button>
                </motion.div>
              </div>
            </div>

            <div className="mt-6">
              <RecentPosts />
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="pl-64 transition-all duration-300">
        <Header onNotificationsClick={() => setShowNotifications(true)} />
        <main className="p-8">
          {renderContent()}
        </main>
      </div>
      <NotificationsPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </div>
  );
};

export default Dashboard;
