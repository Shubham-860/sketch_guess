import React, {type Ref, useEffect, useImperativeHandle, useRef} from 'react';

type CanvasProps = {
    color: string;
    brush: number;
    ref?: Ref<CanvasHandle>
}
type Points = {
    x: number,
    y: number,
}
type Stroke = {
    points: Points[];
    color: string;
    size: number;
}
export type CanvasHandle = {
    undo: () => void,
    clear: () => void,
}
const Canvas = ({color, brush, ref}: CanvasProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawingRef = useRef(false);
    const pointsRef = useRef<Points[]>([]);
    const strokesRef = useRef<Stroke[]>([]);

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

            redrawAll(strokesRef.current); // <- add this
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
        }
    }

    const drawSegment = (points: { x: number; y: number }[]) => {
        const context = canvasRef.current?.getContext("2d")
        if (!context || points.length < 2) return;
        const [previousPoints, currentPoints] = points.slice(-2);
        context.strokeStyle = color;
        context.lineWidth = brush;
        context.lineCap = "round";

        context.beginPath();
        context.moveTo(previousPoints.x, previousPoints.y);
        context.lineTo(currentPoints.x, currentPoints.y);
        context.stroke()
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
            })
            context.stroke()
        })
    }

    useImperativeHandle(ref, () => ({
        undo: () => {
            strokesRef.current = strokesRef.current.slice(0, -1);
            redrawAll(strokesRef.current);
        },
        clear: () => {
            strokesRef.current = []
            redrawAll(strokesRef.current);
        }
    }))

    const handlePointerDown = (evet: React.PointerEvent<HTMLCanvasElement>) => {
        isDrawingRef.current = true;
        pointsRef.current = [getPosition(evet)];
        evet.currentTarget.setPointerCapture(evet.pointerId);

    }

    const handlePointerMove = (evet: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isDrawingRef.current) return;
        pointsRef.current.push(getPosition(evet));
        drawSegment(pointsRef.current);
    }

    const handlePointerUp = () => {
        if (!isDrawingRef.current) return;

        isDrawingRef.current = false;

        const stroke: Stroke = {
            points: [...pointsRef.current],
            color,
            size: brush
        }
        strokesRef.current.push(stroke);
        redrawAll(strokesRef.current);
        console.log(strokesRef.current)
        pointsRef.current = [];
    }
    return (
        <canvas
            ref={canvasRef}
            className={"h-96 w-full bg-white rounded touch-none "}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
        />
    );
};

export default Canvas;
