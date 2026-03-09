"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Pen, Circle, Type, Ruler, Undo2, Download, X, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

type Tool = "pen" | "circle" | "text" | "ruler";

type Annotation = {
    id: string;
    tool: Tool;
    color: string;
    points?: { x: number; y: number }[];     // pen
    center?: { x: number; y: number };        // circle
    radius?: number;                           // circle
    start?: { x: number; y: number };         // ruler
    end?: { x: number; y: number };           // ruler
    label?: string;                            // ruler measurement or text
    position?: { x: number; y: number };      // text
};

type Props = {
    imageUrl: string;
    onClose: () => void;
    onSave?: (dataUrl: string) => void;
};

const COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#f59e0b", "#ffffff"];

export function PhotoAnnotator({ imageUrl, onClose, onSave }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [tool, setTool] = useState<Tool>("pen");
    const [color, setColor] = useState(COLORS[0]);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [annotations, setAnnotations] = useState<Annotation[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentAnnotation, setCurrentAnnotation] = useState<Annotation | null>(null);
    const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);

    // Load background image
    useEffect(() => {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.onload = () => setBgImage(img);
        img.src = imageUrl;
    }, [imageUrl]);

    const getCanvasCoords = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
        const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
        return {
            x: ((clientX - rect.left) / rect.width) * canvas.width,
            y: ((clientY - rect.top) / rect.height) * canvas.height,
        };
    }, []);

    // Redraw canvas
    const redraw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !bgImage) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = bgImage.width;
        canvas.height = bgImage.height;
        ctx.drawImage(bgImage, 0, 0);

        const allAnnotations = [...annotations, ...(currentAnnotation ? [currentAnnotation] : [])];

        allAnnotations.forEach(ann => {
            ctx.strokeStyle = ann.color;
            ctx.fillStyle = ann.color;
            ctx.lineWidth = 3;
            ctx.lineCap = "round";

            if (ann.tool === "pen" && ann.points && ann.points.length > 1) {
                ctx.beginPath();
                ctx.moveTo(ann.points[0].x, ann.points[0].y);
                ann.points.forEach(p => ctx.lineTo(p.x, p.y));
                ctx.stroke();
            }

            if (ann.tool === "circle" && ann.center && ann.radius) {
                ctx.beginPath();
                ctx.arc(ann.center.x, ann.center.y, ann.radius, 0, Math.PI * 2);
                ctx.stroke();
            }

            if (ann.tool === "ruler" && ann.start && ann.end) {
                ctx.beginPath();
                ctx.setLineDash([8, 4]);
                ctx.moveTo(ann.start.x, ann.start.y);
                ctx.lineTo(ann.end.x, ann.end.y);
                ctx.stroke();
                ctx.setLineDash([]);

                // Endpoints
                [ann.start, ann.end].forEach(p => {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
                    ctx.fill();
                });

                // Label
                if (ann.label) {
                    const midX = (ann.start.x + ann.end.x) / 2;
                    const midY = (ann.start.y + ann.end.y) / 2;
                    ctx.font = "bold 16px sans-serif";
                    ctx.fillStyle = ann.color;
                    ctx.textAlign = "center";
                    ctx.fillText(ann.label, midX, midY - 10);
                }
            }

            if (ann.tool === "text" && ann.position && ann.label) {
                ctx.font = "bold 20px sans-serif";
                ctx.textAlign = "left";
                ctx.fillText(ann.label, ann.position.x, ann.position.y);
            }
        });
    }, [bgImage, annotations, currentAnnotation]);

    useEffect(() => { redraw(); }, [redraw]);

    const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
        const coords = getCanvasCoords(e);
        setIsDrawing(true);

        if (tool === "pen") {
            setCurrentAnnotation({ id: crypto.randomUUID(), tool, color, points: [coords] });
        } else if (tool === "circle") {
            setCurrentAnnotation({ id: crypto.randomUUID(), tool, color, center: coords, radius: 0 });
        } else if (tool === "ruler") {
            setCurrentAnnotation({ id: crypto.randomUUID(), tool, color, start: coords, end: coords });
        } else if (tool === "text") {
            const text = prompt("Enter annotation text:");
            if (text) {
                setAnnotations(prev => [...prev, { id: crypto.randomUUID(), tool, color, position: coords, label: text }]);
            }
            setIsDrawing(false);
        }
    };

    const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !currentAnnotation) return;
        const coords = getCanvasCoords(e);

        if (tool === "pen") {
            setCurrentAnnotation(prev => prev ? { ...prev, points: [...(prev.points || []), coords] } : null);
        } else if (tool === "circle" && currentAnnotation.center) {
            const dx = coords.x - currentAnnotation.center.x;
            const dy = coords.y - currentAnnotation.center.y;
            setCurrentAnnotation(prev => prev ? { ...prev, radius: Math.sqrt(dx * dx + dy * dy) } : null);
        } else if (tool === "ruler") {
            setCurrentAnnotation(prev => prev ? { ...prev, end: coords } : null);
        }
    };

    const handlePointerUp = () => {
        if (currentAnnotation) {
            let finalAnnotation = currentAnnotation;
            if (tool === "ruler") {
                const length = prompt("Enter measurement (e.g. '3 cm'):");
                if (length) finalAnnotation = { ...finalAnnotation, label: length };
            }
            setAnnotations(prev => [...prev, finalAnnotation]);
            setCurrentAnnotation(null);
        }
        setIsDrawing(false);
    };

    const handleUndo = () => setAnnotations(prev => prev.slice(0, -1));

    const handleExport = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dataUrl = canvas.toDataURL("image/png");
        if (onSave) {
            onSave(dataUrl);
        } else {
            const link = document.createElement("a");
            link.download = "annotated-photo.png";
            link.href = dataUrl;
            link.click();
        }
    };

    const tools: { id: Tool; icon: typeof Pen; label: string }[] = [
        { id: "pen", icon: Pen, label: "Draw" },
        { id: "circle", icon: Circle, label: "Circle" },
        { id: "text", icon: Type, label: "Text" },
        { id: "ruler", icon: Ruler, label: "Ruler" },
    ];

    return (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col animate-in-up">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-3 bg-black/50 backdrop-blur-sm">
                <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-1">
                    {tools.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTool(t.id)}
                            className={cn(
                                "p-2 rounded-lg transition-all",
                                tool === t.id ? "bg-white/20 text-white" : "text-white/50 hover:text-white/80"
                            )}
                            title={t.label}
                        >
                            <t.icon className="w-4 h-4" />
                        </button>
                    ))}
                    <div className="w-px h-5 bg-white/20 mx-1" />
                    <div className="relative">
                        <button
                            onClick={() => setShowColorPicker(!showColorPicker)}
                            className="p-2 rounded-lg text-white/50 hover:text-white/80 transition-all"
                        >
                            <Palette className="w-4 h-4" />
                        </button>
                        {showColorPicker && (
                            <div className="absolute top-full right-0 mt-2 flex gap-1.5 bg-black/70 p-2 rounded-xl backdrop-blur-sm">
                                {COLORS.map(c => (
                                    <button
                                        key={c}
                                        onClick={() => { setColor(c); setShowColorPicker(false); }}
                                        className={cn(
                                            "w-6 h-6 rounded-full border-2 transition-transform",
                                            color === c ? "border-white scale-110" : "border-transparent"
                                        )}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleUndo} className="text-white/50 hover:text-white transition-colors" title="Undo">
                        <Undo2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleExport}
                        className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1.5"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Save
                    </button>
                </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
                <canvas
                    ref={canvasRef}
                    onMouseDown={handlePointerDown}
                    onMouseMove={handlePointerMove}
                    onMouseUp={handlePointerUp}
                    onMouseLeave={handlePointerUp}
                    onTouchStart={handlePointerDown}
                    onTouchMove={handlePointerMove}
                    onTouchEnd={handlePointerUp}
                    className="max-w-full max-h-full rounded-lg shadow-2xl cursor-crosshair touch-none"
                />
            </div>
        </div>
    );
}
