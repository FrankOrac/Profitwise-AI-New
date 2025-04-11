import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Chart from "@/lib/chart-setup";

type TimeRange = "1D" | "1W" | "1M" | "1Y" | "ALL";

interface PortfolioChartProps {
  className?: string;
}

export function PortfolioChart({ className }: PortfolioChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [selectedRange, setSelectedRange] = useState<TimeRange>("1M");
  const [isLoading, setIsLoading] = useState(false);
  const [chartInstance, setChartInstance] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Simulated chart data for different time ranges
  const chartData: Record<TimeRange, { labels: string[], values: number[] }> = {
    "1D": {
      labels: ["9:30", "10:30", "11:30", "12:30", "13:30", "14:30", "15:30", "16:00"],
      values: [31800, 31600, 31900, 32100, 32000, 32200, 32400, 32594],
    },
    "1W": {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      values: [31200, 31000, 31500, 31800, 32100, 32300, 32594],
    },
    "1M": {
      labels: ['Jun 1', 'Jun 8', 'Jun 15', 'Jun 22', 'Jun 29', 'Jul 6', 'Jul 13', 'Jul 20', 'Jul 27'],
      values: [28500, 29100, 28700, 29800, 30200, 31500, 31200, 32000, 32594],
    },
    "1Y": {
      labels: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
      values: [25000, 26200, 27000, 26500, 28000, 29500, 29000, 30500, 31000, 30800, 31500, 32594],
    },
    "ALL": {
      labels: ["2020", "2021", "2022", "2023", "2024"],
      values: [15000, 20000, 23000, 28000, 32594],
    },
  };

  const handleRangeChange = (range: TimeRange) => {
    setIsLoading(true);
    setSelectedRange(range);

    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  useEffect(() => {
    if (!chartRef.current) return;

    // Clean up previous chart instance
    if (chartInstance) {
      chartInstance.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    try {
      const data = chartData[selectedRange];

      const newChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.labels,
          datasets: [{
            label: 'Portfolio Value',
            data: data.values,
            borderColor: '#0050C8',
            backgroundColor: 'rgba(0, 80, 200, 0.1)',
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
            },
            tooltip: {
              mode: 'index',
              intersect: false
            }
          },
          scales: {
            y: {
              beginAtZero: false,
              grid: {
                borderDash: [3, 3]
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        }
      });

      setChartInstance(newChartInstance);
    } catch (err) {
      setError("Failed to create chart");
      console.error('Failed to create chart', err);
    }

    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, [selectedRange]);

  useEffect(() => {
    if (!chartRef.current) return;

    try {
      // Chart initialization code (already in the above useEffect)
    } catch (err) {
      setError("Failed to initialize chart");
      console.error(err);
    }
  }, []);

  if (error) {
    return <div className="text-error">{error}</div>;
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">Portfolio Performance</h2>
          <div className="flex space-x-2">
            {(["1D", "1W", "1M", "1Y", "ALL"] as TimeRange[]).map((range) => (
              <Button
                key={range}
                variant="outline"
                size="sm"
                className={cn(
                  "text-xs py-1 px-3",
                  selectedRange === range && "bg-primary-50 border-primary-200 text-primary-700"
                )}
                onClick={() => handleRangeChange(range)}
                disabled={isLoading}
              >
                {range}
              </Button>
            ))}
          </div>
        </div>

        <div className="w-full h-[300px] relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
              <LoaderCircle className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          )}
          <canvas ref={chartRef} height={300}></canvas>
        </div>
      </CardContent>
    </Card>
  );
}

export default PortfolioChart;