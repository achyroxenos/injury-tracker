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
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Recovery<span className="text-primary">.ai</span></h1>
          <p className="text-sm text-muted-foreground">Welcome back, Daniel</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold">{streak} Day Streak</span>
        </div>
      </header>

      {/* Notification Manager */}
      <NotificationManager />

      <WeatherWidget />

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* The original Plus button Link was here, but the instruction implies it's part of a new grid item or removed.
            For now, I'll assume the instruction's snippet for the Link is a placeholder for a grid item.
            Given the instruction, the previous header content is replaced.
            I will re-add the Plus button as a separate element if it's not part of the new grid.
            Based on the instruction, the `Link` with `Plus` button is now inside this grid.
            However, the instruction snippet is incomplete for the `Link` tag.
            I will assume the `Link` is intended to be one of the grid items.
            Since the instruction only shows a fragment of the Link, and then the `</div>` for the grid,
            I will place the original Link inside this grid for now, assuming it's meant to be a grid item.
            If it's not, further clarification would be needed.
            For now, I'll put the original Link as the first item in this new grid.
        */}
        <Link href="/log" className="bg-primary text-primary-foreground p-2 rounded-full shadow-lg flex items-center justify-center">
          <Plus className="w-6 h-6" />
        </Link>
        {/* Other grid items would go here */}
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
        <div className="grid gap-4">
          <h2 className="font-semibold text-lg">Your Recoveries</h2>
          {activeInjuries.map((injury) => {
            const latestLog = getLatestLog(injury.id);
            return (
              <Link key={injury.id} href={`/chat?context=${injury.id}`}>
                <Card className="overflow-hidden hover:border-primary/50 transition-colors group">
                  <div className="flex">
                    <div className="w-24 bg-secondary flex-shrink-0 relative">
                      {latestLog?.imageUrl ? (
                        <img src={latestLog.imageUrl} alt={injury.bodyPart} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-secondary">
                          <Activity className="text-muted-foreground" />
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
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 border-none text-white">
          <CardContent className="p-4 flex flex-col justify-between h-32">
            <Activity className="w-6 h-6 opacity-80" />
            <div>
              <p className="text-xs font-medium opacity-80 uppercase tracking-wider">Health Status</p>
              <p className="font-bold text-lg">Good Condition</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-primary/20">
          <CardContent className="p-4 flex flex-col justify-between h-32">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold">AI</span>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Daily Tip</p>
              <p className="font-medium text-sm text-foreground line-clamp-2">"Keep your wounds clean and covered for faster healing."</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
