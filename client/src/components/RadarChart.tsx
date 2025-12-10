import { useEffect, useRef } from "react";

interface RadarChartProps {
  data: {
    label: string;
    value: number;
    max: number;
  }[];
  title?: string;
  size?: number;
}

export default function RadarChart({ data, title, size = 300 }: RadarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 3;
    const levels = 5;
    const angleSlice = (Math.PI * 2) / data.length;

    // Clear canvas
    ctx.fillStyle = "rgba(15, 23, 42, 1)";
    ctx.fillRect(0, 0, size, size);

    // Draw grid circles
    ctx.strokeStyle = "rgba(147, 112, 219, 0.3)";
    ctx.lineWidth = 1;
    for (let i = 1; i <= levels; i++) {
      const r = (radius / levels) * i;
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = "rgba(147, 112, 219, 0.5)";
    ctx.lineWidth = 1;
    for (let i = 0; i < data.length; i++) {
      const angle = angleSlice * i - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    // Draw data polygon
    ctx.fillStyle = "rgba(168, 85, 247, 0.3)";
    ctx.strokeStyle = "rgba(168, 85, 247, 1)";
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let i = 0; i < data.length; i++) {
      const angle = angleSlice * i - Math.PI / 2;
      const value = data[i].value / data[i].max;
      const r = radius * value;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw labels
    ctx.fillStyle = "rgba(196, 181, 253, 1)";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let i = 0; i < data.length; i++) {
      const angle = angleSlice * i - Math.PI / 2;
      const x = centerX + (radius + 30) * Math.cos(angle);
      const y = centerY + (radius + 30) * Math.sin(angle);
      ctx.fillText(data[i].label, x, y);
    }

    // Draw values
    ctx.fillStyle = "rgba(168, 85, 247, 1)";
    ctx.font = "bold 11px sans-serif";
    for (let i = 0; i < data.length; i++) {
      const angle = angleSlice * i - Math.PI / 2;
      const value = data[i].value / data[i].max;
      const r = radius * value;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      ctx.fillText(data[i].value.toString(), x, y - 8);
    }
  }, [data, size]);

  return (
    <div className="flex flex-col items-center">
      {title && <h3 className="text-white font-semibold mb-4">{title}</h3>}
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="bg-slate-800 rounded-lg"
      />
    </div>
  );
}
