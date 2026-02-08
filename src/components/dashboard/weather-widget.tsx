"use client";

import React, { useEffect, useState } from "react";
import { Cloud, Sun, Droplets, Wind } from "lucide-react";

export function WeatherWidget() {
    const [weather, setWeather] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock location for prototype (New York) to avoid permission prompts blocking the demo
        const lat = 40.7128;
        const lon = -74.0060;

        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,surface_pressure&temperature_unit=celsius`)
            .then(res => res.json())
            .then(data => {
                setWeather(data.current);
                setLoading(false);
            })
            .catch(err => {
                console.error("Weather fetch failed", err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="h-24 bg-card rounded-xl animate-pulse" />;
    if (!weather) return null;

    const isHighPressure = weather.surface_pressure > 1020;
    const isHighHumidity = weather.relative_humidity_2m > 60;

    return (
        <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 p-4 rounded-xl flex items-center justify-between mb-4">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <Cloud className="w-5 h-5 text-blue-500" />
                    <span className="font-bold text-lg">{weather.temperature_2m}°C</span>
                </div>
                <div className="text-xs text-muted-foreground flex gap-3">
                    <span className="flex items-center gap-1"><Droplets className="w-3 h-3" /> {weather.relative_humidity_2m}%</span>
                    <span className="flex items-center gap-1"><Wind className="w-3 h-3" /> {weather.surface_pressure}hPa</span>
                </div>
            </div>

            <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Pain Forecast</div>
                {isHighPressure || isHighHumidity ? (
                    <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-full">High Joint Pain Risk</span>
                ) : (
                    <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">Low Pain Risk</span>
                )}
            </div>
        </div>
    );
}
