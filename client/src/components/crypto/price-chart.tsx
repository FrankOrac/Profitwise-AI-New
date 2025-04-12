
import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMarketData } from "@/hooks/use-market-data";
import Chart from "@/lib/chart-setup";

interface PriceChartProps {
  symbol: string;
  className?: string;
}

export function PriceChart({ symbol, className }: PriceChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const { data: marketData } = useMarketData(symbol);

  useEffect(() => {
    if (!chartRef.current || !marketData) return;
    
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: marketData.timestamps,
        datasets: [{
          label: `${symbol} Price`,
          data: marketData.prices,
          borderColor: '#F0B90B',
          backgroundColor: 'rgba(240, 185, 11, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: false
          }
        }
      }
    });

    return () => chart.destroy();
  }, [marketData, symbol]);

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="h-[300px]">
          <canvas ref={chartRef} />
        </div>
      </CardContent>
    </Card>
  );
}
