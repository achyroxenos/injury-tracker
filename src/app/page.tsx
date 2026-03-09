"use client";

import Link from "next/link";
import { WeatherWidget } from "@/components/dashboard/weather-widget";
import { Plus, TrendingUp, Activity, ArrowRight, Calendar } from "lucide-react";
import { useInjury } from "@/context/injury-context";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { NotificationManager } from "@/components/notifications/notification-manager";

export default function Home() {
  const { injuries, getStreak } = useInjury();
  const activeInjuries = injuries.filter(i => !i.archived);
  const streak = getStreak();

  const getLatestLog = (injuryId: string) => {
    const injury = injuries.find(i => i.id === injuryId);
    if (!injury || injury.logs.length === 0) return null;
    return injury.logs[injury.logs.length - 1]; // Last one is latest
  };

  return (
    <div className="space-y-6 animate-in-up pb-[100px]">
      <header className="flex justify-between items-center mb-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Heal<span className="text-primary">Trace</span></h1>
          <p className="text-sm font-medium text-muted-foreground mt-1">Welcome back, Daniel</p>
        </div>
        <div className="flex items-center gap-2 bg-gradient-to-r from-primary/20 to-primary/5 px-4 py-2 rounded-full border border-primary/10 shadow-sm">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-primary-foreground/90 dark:text-primary-foreground">{streak} Day Streak</span>
        </div>
      </header>

      {/* Notification Manager */}
      <NotificationManager />

      <div className="animate-scale-in animation-delay-100">
        <WeatherWidget />
      </div>


      {activeInjuries.length === 0 ? (
        <Card className="border-dashed border-2 bg-secondary/20">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <Activity className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No Active Injuries</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-[200px]">
              Stay safe! If you need to track something, tap the plus button.
            </p>
            <Link href="/log" className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg text-sm font-medium">
              Log Injury
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 animate-in-up animation-delay-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-xl tracking-tight">Your Recoveries</h2>
            <Link href="/gallery" className="text-xs font-semibold text-primary hover:underline">View All</Link>
          </div>
          {activeInjuries.map((injury) => {
            const latestLog = getLatestLog(injury.id);
            return (
              <Link key={injury.id} href={`/chat?context=${injury.id}`}>
                <Card className="overflow-hidden border-border/50 hover:border-primary/40 hover:shadow-md transition-all duration-300 group hover:-translate-y-1 bg-card/80 backdrop-blur-sm">
                  <div className="flex">
                    <div className="w-28 bg-secondary/50 flex-shrink-0 relative overflow-hidden">
                      {latestLog?.imageUrl ? (
                        <img src={latestLog.imageUrl} alt={injury.bodyPart} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-secondary/80 group-hover:bg-secondary transition-colors">
                          <Activity className="text-muted-foreground/50 w-8 h-8" />
                        </div>
                      )}

                      {/* Badge for # of updates */}
                      <div className="absolute bottom-1 right-1 bg-black/50 text-white text-[10px] px-1.5 rounded-full backdrop-blur-sm">
                        {injury.logs.length} updates
                      </div>
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{injury.bodyPart}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-1">{injury.cause}</p>
                        </div>
                        {latestLog && (
                          <span className={cn(
                            "text-[10px] px-2 py-1 rounded-full font-medium border",
                            latestLog.painLevel > 5
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-green-50 text-green-700 border-green-200"
                          )}>
                            Pain: {latestLog.painLevel}/10
                          </span>
                        )}
                      </div>

                      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(injury.startDate).toLocaleDateString()}</span>
                        <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* Quick Actions / Insights */}
      <div className="grid grid-cols-2 gap-4 mt-8 animate-in-up animation-delay-300">
        <Card className="bg-gradient-to-br from-indigo-500 via-purple-500 to-primary/80 border-none text-white shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow">
          <CardContent className="p-5 flex flex-col justify-between h-36">
            <Activity className="w-7 h-7 opacity-90 drop-shadow-sm mb-2" />
            <div>
              <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mb-1">Health Status</p>
              <p className="font-black text-lg leading-tight">Good<br />Condition</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass dark:glass-dark border-primary/20 hover:border-primary/40 transition-colors shadow-sm">
          <CardContent className="p-5 flex flex-col justify-between h-36">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2 shadow-inner">
              <span className="text-primary font-black text-sm">AI</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Daily Tip</p>
              <p className="font-medium text-xs text-foreground line-clamp-3 leading-relaxed">"Keep your wounds clean and covered for faster healing."</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
