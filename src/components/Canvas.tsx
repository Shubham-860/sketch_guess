import React, {type Ref, useEffect, useImperativeHandle, useRef} from 'react';

type CanvasProps = {
    color: string;
    brush: number;
    readOnly?: boolean;
    ref?: Ref<CanvasHandle>;
    onDrawStart?: (point: Point, color: string, size: number) => void;
    onDrawMove?: (point: Point) => void;
    onDrawEnd?: () => void;
};
type Point = {
    x: number;
    y: number;
};
type Stroke = {
    points: Point[];
    color: string;
    size: number;
};
export type CanvasHandle = {
    undo: () => void;
    clear: () => void;
    remoteDrawStart: (point: Point, color: string, size: number) => void;
    remoteDrawMove: (point: Point) => void;
    remoteDrawEnd: () => void;
    loadStrokes: (strokes: Stroke[]) => void;
};

const Canvas = ({color, brush, readOnly = false, ref, onDrawStart, onDrawMove, onDrawEnd}: CanvasProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawingRef = useRef(false);
    const pointsRef = useRef<Point[]>([]);
    const strokesRef = useRef<Stroke[]>([]);
    const remotePointsRef = useRef<Point[]>([]);
    const remoteStyleRef = useRef<{ color: string; size: number }>({color: "#000000", size: 1});

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resizeCanvas = () => {
            const {width, height} = canvas.getBoundingClientRect();
            const devicePixelRatio = window.devicePixelRatio || 1;

            canvas.width = Math.round(width * devicePixelRatio);
            canvas.height = Math.round(height * devicePixelRatio);

            const context = canvas.getContext("2d");
            context?.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

            redrawAll(strokesRef.current);
        };
        resizeCanvas();

        const resizeObserver = new ResizeObserver(resizeCanvas);
        resizeObserver.observe(canvas);

        return () => resizeObserver.disconnect();
    }, []);

    const getPosition = (event: React.PointerEvent<HTMLCanvasElement>) => {
        const pos = canvasRef.current!.getBoundingClientRect();
        return {
            x: event.clientX - pos.left,
            y: event.clientY - pos.top
        };
    };

    const drawSegment = (points: Point[], strokeColor: string, size: number) => {
        const context = canvasRef.current?.getContext("2d");
        if (!context || points.length < 2) return;
        const [previousPoints, currentPoints] = points.slice(-2);
        context.strokeStyle = strokeColor;
        context.lineWidth = size;
        context.lineCap = "round";

        context.beginPath();
        context.moveTo(previousPoints.x, previousPoints.y);
        context.lineTo(currentPoints.x, currentPoints.y);
        context.stroke();
    };

    const redrawAll = (strokes: Stroke[]) => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d");
        if (!canvas || !context) return;

        const {width, height} = canvas.getBoundingClientRect();

        // remove everything
        context.clearRect(0, 0, width, height);

        // Redraws from saved data
        strokes.forEach(stroke => {
            if (stroke.points.length < 2) return;

            context.strokeStyle = stroke.color;
            context.lineWidth = stroke.size;
            context.lineCap = "round";
            context.lineJoin = "round";

            context.beginPath();
            context.moveTo(stroke.points[0].x, stroke.points[0].y);

            stroke.points.slice(1).forEach(point => {
                context.lineTo(point.x, point.y);
            });
            context.stroke();
        });
    };

    useImperativeHandle(ref, () => ({
        undo: () => {
            strokesRef.current = strokesRef.current.slice(0, -1);
            redrawAll(strokesRef.current);
        },
        clear: () => {
            strokesRef.current = [];
            redrawAll(strokesRef.current);
        },
        remoteDrawStart: (point, remoteColor, remoteSize) => {
            remotePointsRef.current = [point];
            remoteStyleRef.current = {color: remoteColor, size: remoteSize};
        },
        remoteDrawMove: (point) => {
            remotePointsRef.current.push(point);
            drawSegment(remotePointsRef.current, remoteStyleRef.current.color, remoteStyleRef.current.size);
        },
        remoteDrawEnd: () => {
            strokesRef.current.push({
                points: [...remotePointsRef.current],
                color: remoteStyleRef.current.color,
                size: remoteStyleRef.current.size
            });
            remotePointsRef.current = [];
        },
        loadStrokes: (strokes: Stroke[]) => {
            strokesRef.current = strokes;
            redrawAll(strokes);
        }
    }));

    const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
        if (readOnly) return;
        isDrawingRef.current = true;
        const pos = getPosition(event);
        pointsRef.current = [pos];
        event.currentTarget.setPointerCapture(event.pointerId);

        onDrawStart?.(pos, color, brush);
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
        if (readOnly || !isDrawingRef.current) return;
        const pos = getPosition(event);
        pointsRef.current.push(pos);
        drawSegment(pointsRef.current, color, brush);

        onDrawMove?.(pos);
    };

    const handlePointerUp = () => {
        if (readOnly || !isDrawingRef.current) return;

        isDrawingRef.current = false;

        const stroke: Stroke = {
            points: [...pointsRef.current],
            color,
            size: brush
        };
        strokesRef.current.push(stroke);
        redrawAll(strokesRef.current);
        pointsRef.current = [];
        onDrawEnd?.();
    };

    return (
        <canvas
            ref={canvasRef}
            className={`h-96 w-full bg-white rounded touch-none ${
                readOnly ? 'cursor-not-allowed pointer-events-none' : 'cursor-crosshair'
            }`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
        />
    );
};

export default Canvas;
