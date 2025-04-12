import { Helmet } from "react-helmet";
import Sidebar from "@/components/ui/sidebar";
import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Link } from "wouter";
import {
  BarChart3,
  Users,
  BookOpen,
  TrendingUp,
  Lightbulb,
  DollarSign,
  Calendar,
  ArrowRight,
  Loader2,
  Activity,
  RefreshCw,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Chart } from "chart.js/auto";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  positive?: boolean;
}

const MetricCard = ({ title, value, icon, trend, positive = true }: MetricCardProps) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 mb-1">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {trend && (
            <p className={`text-xs ${positive ? 'text-success' : 'text-error'} mt-1`}>
              {positive ? '↑' : '↓'} {trend} vs. last month
            </p>
          )}
        </div>
        <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center text-primary-600">
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function AdminDashboard() {
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    refetchInterval: 30000,
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/admin/analytics/overview"],
    refetchInterval: 30000,
  });

  const { data: revenueData } = useQuery({
    queryKey: ["/api/admin/analytics/revenue"],
    refetchInterval: 60000,
  });

  const metrics = {
    totalUsers: analytics?.totalUsers || 0,
    activeUsers: analytics?.activeUsers || 0,
    revenue: analytics?.totalRevenue?.toFixed(2) || "0.00",
    growth: analytics?.userGrowth?.monthly || 0
  };

  const { data: activityLogs = [] } = useQuery({
    queryKey: ["/api/admin/activity-logs"],
    refetchInterval: 15000,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["/api/admin/tasks"],
    refetchInterval: 30000,
  });

  const usersBySubscription = {
    basic: users.filter(user => user.subscriptionTier === "basic").length,
    pro: users.filter(user => user.subscriptionTier === "pro").length,
    enterprise: users.filter(user => user.subscriptionTier === "enterprise").length,
  };

  const userChartRef = useRef<HTMLCanvasElement>(null);
  const revenueChartRef = useRef<HTMLCanvasElement>(null);
  const [userChartInstance, setUserChartInstance] = useState<any>(null);
  const [revenueChartInstance, setRevenueChartInstance] = useState<any>(null);

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    inProgress: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    blocked: "bg-red-100 text-red-800"
  };

  const revenueData = [
    { month: 'Jan', revenue: 1200 },
    { month: 'Feb', revenue: 1900 },
    { month: 'Mar', revenue: 2300 },
    { month: 'Apr', revenue: 2800 },
    { month: 'May', revenue: 3200 },
    { month: 'Jun', revenue: 4000 },
  ];

  useEffect(() => {
    if (!userChartRef.current) return;
    
    const setupChart = async () => {
      if (userChartInstance) {
        userChartInstance.destroy();
      }

      const ctx = userChartRef.current.getContext('2d');
      if (!ctx) return;

      const { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip } = await import('chart.js');
      Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

      const newChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'New Users',
            data: [12, 19, 15, 28, 32, 40],
            backgroundColor: '#0050C8',
            borderRadius: 4,
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
              beginAtZero: true,
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

      setUserChartInstance(newChartInstance);
    };

    setupChart();

    return () => {
      if (userChartInstance) {
        userChartInstance.destroy();
      }
    };
  }, []);

  useEffect(() => {
    let chartInstance: any = null;
    
    const setupChart = async () => {
      const canvas = revenueChartRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Chart.js components are already registered in chart-setup.ts

      // Clean up any existing chart on the canvas
      const existingChart = Chart.getChart(canvas);
      if (existingChart) {
        existingChart.destroy();
      }
      
      chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: revenueData.map(d => d.month),
          datasets: [{
            label: 'Monthly Revenue',
            data: revenueData.map(d => d.revenue),
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
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
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return '$' + value;
                }
              },
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
    };

    setupChart();

    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
      const canvas = revenueChartRef.current;
      if (canvas) {
        const existingChart = Chart.getChart(canvas);
        if (existingChart) {
          existingChart.destroy();
        }
      }
    };
  }, [revenueData]);

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | ProfitWise AI</title>
      </Helmet>

      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] min-h-screen">
        <div className="hidden md:block">
          <Sidebar />
        </div>

        <div className="flex flex-col">
          <Header />

          <main className="bg-slate-50 p-6 flex-1 overflow-y-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-slate-500">Overview of platform metrics and user activity</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard 
                title="Total Users" 
                value={usersLoading ? "Loading..." : users.length}
                icon={<Users className="h-6 w-6" />}
                trend="12.5%"
                positive={true}
              />
              <MetricCard 
                title="Active Subscriptions" 
                value={usersLoading ? "Loading..." : usersBySubscription.pro + usersBySubscription.enterprise}
                icon={<DollarSign className="h-6 w-6" />}
                trend="8.3%"
                positive={true}
              />
              <MetricCard 
                title="Education Content" 
                value="24"
                icon={<BookOpen className="h-6 w-6" />}
                trend="4 new"
                positive={true}
              />
              <MetricCard 
                title="AI Insights Generated" 
                value="187"
                icon={<Lightbulb className="h-6 w-6" />}
                trend="24.8%"
                positive={true}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold">User Growth</h2>
                    <Button variant="outline" size="sm">
                      Last 6 Months
                    </Button>
                  </div>
                  <div className="h-[300px]">
                    <canvas ref={userChartRef}></canvas>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold">Revenue</h2>
                    <Button variant="outline" size="sm">
                      Last 6 Months
                    </Button>
                  </div>
                  <div className="h-[300px]">
                    <canvas ref={revenueChartRef}></canvas>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold">Recent Activity</h2>
                  <Button variant="link" className="text-primary-600 p-0">
                    View All
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  {activityLogs.map((log: any, i: number) => (
                    <div key={i} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <div>
                        <p className="text-sm font-medium">{log.action}</p>
                        <p className="text-xs text-slate-500">{log.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold">Tasks</h2>
                  <Button variant="link" className="text-primary-600 p-0">
                    View All
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  {tasks.map((task: any, i: number) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{task.title}</h4>
                        <span className={`px-2 py-1 rounded text-xs ${statusColors[task.status as keyof typeof statusColors]}`}>
                          {task.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{task.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-xs text-slate-500">{task.dueDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </>
  );
}