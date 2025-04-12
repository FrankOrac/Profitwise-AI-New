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
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface MetricCardProps {
  title: string;
  value: string;
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
  // Fetch users with real-time metrics
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch revenue metrics
  const { data: analytics } = useQuery({
    queryKey: ["/api/admin/analytics/overview"],
    refetchInterval: 30000,
  });

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    inProgress: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    blocked: "bg-red-100 text-red-800"
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Platform Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <MetricCard
                title="Total Users"
                value={analytics?.totalUsers || 0}
                trend="+12%"
                icon={<Users className="w-6 h-6" />}
              />
              <MetricCard
                title="Active Users"
                value={analytics?.activeUsers || 0}
                trend="+5%"
                icon={<Activity className="w-6 h-6" />}
              />
              <MetricCard
                title="Total Revenue"
                value={`$${analytics?.totalRevenue || 0}`}
                trend="+8%"
                icon={<DollarSign className="w-6 h-6" />}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activityLogs?.map((log, i) => (
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
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks?.map((task, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{task.title}</h4>
                    <span className={`px-2 py-1 rounded text-xs ${statusColors[task.status]}`}>
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
      </div>
    </div>
  );

  useEffect(() => {
    if (!revenueChartRef.current) return;

    if (revenueChartInstance) {
      revenueChartInstance.destroy();
    }

    const ctx = revenueChartRef.current.getContext('2d');
    if (!ctx) return;

    import('chart.js').then(({ Chart, LineElement, PointElement, LineController, CategoryScale, LinearScale, Tooltip }) => {
      Chart.register(LineElement, PointElement, LineController, CategoryScale, LinearScale, Tooltip);

      const newChartInstance = new Chart(ctx, {
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
            },
            tooltip: {
              callbacks: {
                label: (context) => `$${context.parsed.y.toFixed(2)}`
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => `$${value}`
              }
            }
          }
        }
      });

      setRevenueChartInstance(newChartInstance);
    });
  }, [revenueData]);

  // Fetch real-time activity logs
  const { data: activityLogs } = useQuery({
    queryKey: ["/api/admin/activity-logs"],
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  // Fetch task management data
  const { data: tasks } = useQuery({
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

  useEffect(() => {
    if (!userChartRef.current) return;

    // Clean up previous chart instance
    if (userChartInstance) {
      userChartInstance.destroy();
    }

    const ctx = userChartRef.current.getContext('2d');
    if (!ctx) return;

    // Dynamically import Chart.js
    import('chart.js').then(({ Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip }) => {
      // Register required components
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
    }).catch(err => {
      console.error('Failed to load Chart.js', err);
    });

    return () => {
      if (userChartInstance) {
        userChartInstance.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (!revenueChartRef.current) return;

    // Clean up previous chart instance
    if (revenueChartInstance) {
      revenueChartInstance.destroy();
    }

    const ctx = revenueChartRef.current.getContext('2d');
    if (!ctx) return;

    // Dynamically import Chart.js
    import('chart.js').then(({ Chart, LineElement, PointElement, LineController, CategoryScale, LinearScale, Tooltip }) => {
      // Register required components
      Chart.register(LineElement, PointElement, LineController, CategoryScale, LinearScale, Tooltip);

      const newChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Revenue',
            data: [1200, 1900, 2300, 2800, 3200, 4000],
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

      setRevenueChartInstance(newChartInstance);
    }).catch(err => {
      console.error('Failed to load Chart.js', err);
    });

    return () => {
      if (revenueChartInstance) {
        revenueChartInstance.destroy();
      }
    };
  }, []);

  // Recent activities mock data
  const recentActivities = [
    { id: 1, user: "admin", action: "Added new educational content", time: "2 hours ago" },
    { id: 2, user: "john.doe", action: "Upgraded to Pro plan", time: "5 hours ago" },
    { id: 3, user: "sarah.smith", action: "Generated new AI insight", time: "yesterday" },
    { id: 4, user: "michael.brown", action: "Added 3 assets to portfolio", time: "yesterday" },
    { id: 5, user: "emma.wilson", action: "Registered new account", time: "2 days ago" },
  ];

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

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard 
                title="Total Users" 
                value={usersLoading ? "Loading..." : users.length.toString()}
                icon={<Users className="h-6 w-6" />}
                trend="12.5%"
                positive={true}
              />
              <MetricCard 
                title="Active Subscriptions" 
                value={usersLoading ? "Loading..." : `${usersBySubscription.pro + usersBySubscription.enterprise}`}
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

            {/* Charts */}
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

            {/* Subscription Distribution */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold">Subscription Distribution</h2>
                  <Link href="/admin/users">
                    <Button variant="link" className="text-primary-600 p-0">
                      View All Users
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>

                {usersLoading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <div className="bg-slate-100 rounded-full h-4 mb-6">
                        <div 
                          className="flex rounded-full h-4"
                          style={{
                            background: "linear-gradient(to right, #94A3B8 0%, #94A3B8 calc(var(--basic-percent) * 1%), #0050C8 calc(var(--basic-percent) * 1%), #0050C8 calc((var(--basic-percent) + var(--pro-percent)) * 1%), #7C3AED calc((var(--basic-percent) + var(--pro-percent)) * 1%), #7C3AED 100%)",
                            "--basic-percent": usersBySubscription.basic / users.length * 100,
                            "--pro-percent": usersBySubscription.pro / users.length * 100,
                          } as any}
                        ></div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-2">
                            <div className="w-3 h-3 rounded-full bg-slate-400 mr-2"></div>
                            <span className="text-sm font-medium">Basic</span>
                          </div>
                          <div className="text-2xl font-bold">{usersBySubscription.basic}</div>
                          <div className="text-xs text-slate-500">
                            {(usersBySubscription.basic / users.length * 100).toFixed(1)}%
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center justify-center mb-2">
                            <div className="w-3 h-3 rounded-full bg-primary-600 mr-2"></div>
                            <span className="text-sm font-medium">Pro</span>
                          </div>
                          <div className="text-2xl font-bold">{usersBySubscription.pro}</div>
                          <div className="text-xs text-slate-500">
                            {(usersBySubscription.pro / users.length * 100).toFixed(1)}%
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center justify-center mb-2">
                            <div className="w-3 h-3 rounded-full bg-purple-600 mr-2"></div>
                            <span className="text-sm font-medium">Enterprise</span>
                          </div>
                          <div className="text-2xl font-bold">{usersBySubscription.enterprise}</div>
                          <div className="text-xs text-slate-500">
                            {(usersBySubscription.enterprise / users.length * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1">
                      <h3 className="text-sm font-medium mb-4">Insights</h3>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center mr-2 mt-0.5">
                            <TrendingUp className="h-3 w-3 text-primary-600" />
                          </div>
                          <p className="text-sm text-slate-600">
                            {usersBySubscription.pro} users are on the Pro plan, representing {(usersBySubscription.pro / users.length * 100).toFixed(1)}% of all users.
                          </p>
                        </li>
                        <li className="flex items-start">
                          <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center mr-2 mt-0.5">
                            <TrendingUp className="h-3 w-3 text-primary-600" />
                          </div>
                          <p className="text-sm text-slate-600">
                            Conversion rate from Basic to Pro is 32.5% over the last 30 days.
                          </p>
                        </li>
                        <li className="flex items-start">
                          <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center mr-2 mt-0.5">
                            <TrendingUp className="h-3 w-3 text-primary-600" />
                          </div>
                          <p className="text-sm text-slate-600">
                            Enterprise plan subscriptions have increased by 15% compared to last month.
                          </p>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold">Recent Activity</h2>
                    <Button variant="link" className="text-primary-600 p-0">
                      View All
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>

                  <ul className="divide-y divide-slate-100">
                    {recentActivities.map((activity) => (
                      <li key={activity.id} className="py-3 flex items-start">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mr-3">
                          <span className="text-xs font-medium text-slate-700">
                            {activity.user.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-medium">{activity.user}</span> {activity.action}
                          </p>
                          <p className="text-xs text-slate-500">{activity.time}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold">Upcoming Tasks</h2>
                    <Button variant="link" className="text-primary-600 p-0">
                      View All
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>

                  <ul className="divide-y divide-slate-100">
                    <li className="py-3 flex items-start">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                        <Calendar className="h-4 w-4 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Review new educational content</p>
                        <p className="text-xs text-slate-500">Due tomorrow</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Review
                      </Button>
                    </li>
                    <li className="py-3 flex items-start">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                        <BarChart3 className="h-4 w-4 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Prepare monthly performance report</p>
                        <p className="text-xs text-slate-500">Due in 3 days</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Start
                      </Button>
                    </li>
                    <li className="py-3 flex items-start">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                        <Users className="h-4 w-4 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Review user feedback submissions</p>
                        <p className="text-xs text-slate-500">Due in 5 days</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Review
                      </Button>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}