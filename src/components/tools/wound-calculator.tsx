"use client";

import React, { useRef, useState, useEffect } from "react";
import { Eraser, Pencil, RotateCcw, Ruler } from "lucide-react";

export function WoundAreaCalculator({
    imageUrl,
    onSave
}: {
    imageUrl: string,
    onSave: (areaCm2: number) => void
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [mode, setMode] = useState<"draw" | "erase">("draw");
    const [scaleWidthCm, setScaleWidthCm] = useState(10);
    const [coverage, setCoverage] = useState(0);
    const [estimatedArea, setEstimatedArea] = useState<number | null>(null);

    const redrawPreview = () => {
        const canvas = canvasRef.current;
        const baseCanvas = imageCanvasRef.current;
        const maskCanvas = maskCanvasRef.current;
        if (!canvas || !baseCanvas || !maskCanvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(baseCanvas, 0, 0);

        // Tint only the masked area so users can see what is selected.
        ctx.save();
        ctx.fillStyle = "rgba(225, 29, 72, 0.45)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = "destination-in";
        ctx.drawImage(maskCanvas, 0, 0);
        ctx.restore();
    };

    const getPaintedPixelCount = () => {
        const maskCanvas = maskCanvasRef.current;
        if (!maskCanvas) return 0;

        const maskCtx = maskCanvas.getContext("2d");
        if (!maskCtx) return 0;

        const imageData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height).data;
        let paintedPixels = 0;

        for (let index = 3; index < imageData.length; index += 4) {
            if (imageData[index] > 0) paintedPixels++;
        }

        return paintedPixels;
    };

    const recalculateEstimate = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const totalPixels = canvas.width * canvas.height;
        if (totalPixels === 0) return;

        const paintedPixels = getPaintedPixelCount();
        const nextCoverage = paintedPixels / totalPixels;
        const widthCm = Math.max(0.1, scaleWidthCm);
        const heightCm = widthCm * (canvas.height / canvas.width);
        const totalAreaCm2 = widthCm * heightCm;
        const area = Number((totalAreaCm2 * nextCoverage).toFixed(2));

        setCoverage(nextCoverage);
        setEstimatedArea(area);
        onSave(area);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imageUrl;
        img.onload = () => {
            const width = 300;
            const height = Math.round((img.height / img.width) * width);

            canvas.width = width;
            canvas.height = height;

            const baseCanvas = document.createElement("canvas");
            baseCanvas.width = width;
            baseCanvas.height = height;
            const baseCtx = baseCanvas.getContext("2d");
            if (!baseCtx) return;
            baseCtx.drawImage(img, 0, 0, width, height);

            const maskCanvas = document.createElement("canvas");
            maskCanvas.width = width;
            maskCanvas.height = height;

            imageCanvasRef.current = baseCanvas;
            maskCanvasRef.current = maskCanvas;
            setCoverage(0);
            setEstimatedArea(null);
            redrawPreview();
        };
    }, [imageUrl]);

    const getPointerPosition = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();

        if ("touches" in e) {
            const touch = e.touches[0] ?? e.changedTouches[0];
            return {
                x: touch.clientX - rect.left,
                y: touch.clientY - rect.top,
            };
        }

        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;

        e.preventDefault();
        const maskCanvas = maskCanvasRef.current;
        if (!maskCanvas) return;
        const maskCtx = maskCanvas.getContext("2d");
        if (!maskCtx) return;

        const { x, y } = getPointerPosition(e);

        maskCtx.globalCompositeOperation = mode === "draw" ? "source-over" : "destination-out";
        maskCtx.strokeStyle = "rgba(255,255,255,1)";
        maskCtx.lineWidth = 16;
        maskCtx.lineCap = "round";
        maskCtx.lineJoin = "round";
        maskCtx.lineTo(x, y);
        maskCtx.stroke();
        maskCtx.beginPath();
        maskCtx.moveTo(x, y);

        redrawPreview();
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        const maskCanvas = maskCanvasRef.current;
        if (!maskCanvas) return;
        const maskCtx = maskCanvas.getContext("2d");
        if (!maskCtx) return;

        const { x, y } = getPointerPosition(e);
        setIsDrawing(true);
        maskCtx.globalCompositeOperation = mode === "draw" ? "source-over" : "destination-out";
        maskCtx.strokeStyle = "rgba(255,255,255,1)";
        maskCtx.lineWidth = 16;
        maskCtx.lineCap = "round";
        maskCtx.lineJoin = "round";
        maskCtx.beginPath();
        maskCtx.moveTo(x, y);
        maskCtx.lineTo(x, y);
        maskCtx.stroke();
        redrawPreview();
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        const maskCanvas = maskCanvasRef.current;
        if (!maskCanvas) return;
        const maskCtx = maskCanvas.getContext("2d");
        maskCtx?.beginPath();
    };

    const clearMask = () => {
        const maskCanvas = maskCanvasRef.current;
        if (!maskCanvas) return;

        const maskCtx = maskCanvas.getContext("2d");
        if (!maskCtx) return;

        maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
        setCoverage(0);
        setEstimatedArea(null);
        redrawPreview();
    };

    return (
        <div className="space-y-4">
            <div className="bg-secondary/20 p-4 rounded-xl text-center">
                <p className="text-sm font-bold mb-2">1. Paint the wound area</p>
                <div className="relative inline-block border-2 border-dashed border-primary/50 rounded-lg overflow-hidden touch-none">
                    <canvas
                        ref={canvasRef}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="max-w-full bg-slate-100 cursor-crosshair"
                    />
                </div>
            </div>

            <div className="flex gap-2 justify-center">
                <button
                    type="button"
                    onClick={() => setMode("draw")}
                    className={`p-2 rounded-full ${mode === "draw" ? "bg-primary text-primary-foreground" : "bg-card border"}`}
                >
                    <Pencil className="w-5 h-5" />
                </button>
                <button
                    type="button"
                    onClick={() => setMode("erase")}
                    className={`p-2 rounded-full ${mode === "erase" ? "bg-primary text-primary-foreground" : "bg-card border"}`}
                >
                    <Eraser className="w-5 h-5" />
                </button>
                <button
                    type="button"
                    onClick={clearMask}
                    className="p-2 rounded-full bg-card border"
                    aria-label="Clear marked area"
                >
                    <RotateCcw className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Reference Width (cm)</label>
                <input
                    type="number"
                    value={scaleWidthCm}
                    min={0.1}
                    step={0.1}
                    onChange={(e) => setScaleWidthCm(Number.parseFloat(e.target.value) || 0)}
                    className="w-full p-2 rounded-lg bg-card border"
                />
                <p className="text-[10px] text-muted-foreground">Approximate width of the visible area in the photo.</p>
            </div>

            <div className="rounded-lg border bg-card p-3 text-xs text-muted-foreground">
                <p>Coverage: {(coverage * 100).toFixed(1)}%</p>
                <p>Estimated area: {estimatedArea !== null ? `${estimatedArea} cm²` : "Not calculated yet"}</p>
            </div>

            <button
                type="button"
                onClick={recalculateEstimate}
                className="w-full py-3 bg-secondary text-secondary-foreground rounded-xl font-bold flex items-center justify-center gap-2"
            >
                <Ruler className="w-4 h-4" /> Calculate Area
            </button>
        </div>
    );
}
