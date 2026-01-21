import { motion } from "framer-motion";
import { useState } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Clock,
  Facebook,
  Instagram,
  Twitter,
  Linkedin
} from "lucide-react";
import { cn } from "@/lib/utils";

const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

interface ScheduledPost {
  id: string;
  time: string;
  platform: string;
  title: string;
  color: string;
}

const mockScheduledPosts: Record<number, ScheduledPost[]> = {
  5: [
    { id: "1", time: "09:00", platform: "facebook", title: "Post promocional", color: "bg-[#1877F2]" },
    { id: "2", time: "14:30", platform: "instagram", title: "Stories de produto", color: "bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]" },
  ],
  12: [
    { id: "3", time: "10:00", platform: "twitter", title: "Thread sobre novidades", color: "bg-black" },
  ],
  18: [
    { id: "4", time: "08:00", platform: "linkedin", title: "Artigo corporativo", color: "bg-[#0A66C2]" },
    { id: "5", time: "15:00", platform: "instagram", title: "Reels de produto", color: "bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]" },
    { id: "6", time: "19:00", platform: "facebook", title: "Live stream", color: "bg-[#1877F2]" },
  ],
  24: [
    { id: "7", time: "11:00", platform: "twitter", title: "Campanha", color: "bg-black" },
  ],
};

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case "facebook": return Facebook;
    case "instagram": return Instagram;
    case "twitter": return Twitter;
    case "linkedin": return Linkedin;
    default: return Facebook;
  }
};

export const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const selectedDayPosts = selectedDay ? mockScheduledPosts[selectedDay] || [] : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl mb-2">Calendário Editorial</h1>
        <p className="text-muted-foreground">
          Visualize e gerencie suas publicações agendadas
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card rounded-2xl border border-border p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-xl">
              {months[month]} {year}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={goToPrevMonth}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goToNextMonth}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {daysOfWeek.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              const hasPosts = day && mockScheduledPosts[day];
              const isSelected = day === selectedDay;
              const isToday = day === new Date().getDate() && 
                month === new Date().getMonth() && 
                year === new Date().getFullYear();

              return (
                <motion.div
                  key={index}
                  whileHover={day ? { scale: 1.05 } : {}}
                  className={cn(
                    "aspect-square rounded-xl p-2 transition-all cursor-pointer relative",
                    day ? "hover:bg-muted/50" : "",
                    isSelected && "bg-primary/20 border border-primary/50",
                    isToday && !isSelected && "bg-accent/20 border border-accent/50"
                  )}
                  onClick={() => day && setSelectedDay(day)}
                >
                  {day && (
                    <>
                      <span className={cn(
                        "text-sm font-medium",
                        isToday && "text-accent",
                        isSelected && "text-primary"
                      )}>
                        {day}
                      </span>
                      {hasPosts && (
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                          {mockScheduledPosts[day]!.slice(0, 3).map((post, i) => (
                            <div
                              key={i}
                              className={cn("w-1.5 h-1.5 rounded-full", post.color)}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Details */}
        <div className="glass-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-bold text-lg">
              {selectedDay ? `Dia ${selectedDay}` : "Selecione um dia"}
            </h3>
            <button className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {selectedDay ? (
            selectedDayPosts.length > 0 ? (
              <div className="space-y-3">
                {selectedDayPosts.map((post, index) => {
                  const Icon = getPlatformIcon(post.platform);
                  return (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                          post.color
                        )}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{post.title}</p>
                          <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span className="text-xs">{post.time}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center">
                  <Clock className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-4">
                  Nenhuma publicação agendada
                </p>
                <button className="text-primary text-sm hover:underline">
                  + Agendar publicação
                </button>
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Clique em um dia para ver os detalhes
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
