import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Chart from "@/lib/chart-setup";

interface AssetAllocation {
  name: string;
  percentage: number;
  color: string;
}

interface AllocationChartProps {
  className?: string;
}

export function AllocationChart({ className }: AllocationChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [chartInstance, setChartInstance] = useState<any>(null);
  
  const assetAllocations: AssetAllocation[] = [
    { name: "Stocks", percentage: 42, color: "#F0B90B" },
    { name: "Cryptocurrencies", percentage: 28, color: "#E6007A" },
    { name: "Bonds", percentage: 18, color: "#00FFA3" },
    { name: "Cash", percentage: 12, color: "#627EEA" }
  ];

  useEffect(() => {
    if (!chartRef.current) return;
    
    // Clean up previous chart instance
    if (chartInstance) {
      chartInstance.destroy();
    }
    
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;
    
    try {
      const newChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: assetAllocations.map(asset => asset.name),
          datasets: [{
            data: assetAllocations.map(asset => asset.percentage),
            backgroundColor: assetAllocations.map(asset => asset.color),
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
      
      setChartInstance(newChartInstance);
    } catch (err) {
      console.error('Failed to create doughnut chart', err);
    }
    
    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, []);

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <h2 className="text-lg font-bold mb-4">Asset Allocation</h2>
        <div className="h-[300px] flex items-center justify-center mb-4">
          <canvas ref={chartRef}></canvas>
        </div>
        <div className="mt-4 space-y-2">
          {assetAllocations.map((asset) => (
            <div key={asset.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: asset.color }}
                ></div>
                <span>{asset.name}</span>
              </div>
              <span className="font-medium">{asset.percentage}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default AllocationChart;
