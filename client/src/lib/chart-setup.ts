import { 
  Chart, 
  LineElement, 
  PointElement, 
  LinearScale, 
  CategoryScale, 
  Tooltip, 
  Filler, 
  ArcElement,
  Legend,
  DoughnutController,
  LineController,
  BarController,
  BarElement
} from 'chart.js';

// Register all required Chart.js components
export function setupCharts() {
  Chart.register(
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Tooltip,
    Filler,
    ArcElement,
    Legend,
    DoughnutController,
    LineController,
    BarController,
    BarElement
  );
}

// Call this function on app initialization
setupCharts();

export default Chart;