import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { SubscriptionPlans } from "@/components/subscription/subscription-plans";
import { 
  ArrowRight, 
  BarChart, 
  Brain, 
  Shield, 
  ChartLine, 
  Users, 
  Zap,
  CircleDollarSign,
  TrendingUp,
  Lightbulb,
  BookOpen,
  RefreshCw,
  LineChart,
  PencilLine,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function LandingPage() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const features = [
    { icon: <Brain />, title: "AI-Powered Insights", description: "Advanced algorithms analyze market trends" },
    { icon: <ChartLine />, title: "Real-Time Analytics", description: "Live market data and portfolio tracking" },
    { icon: <RefreshCw />, title: "Portfolio Rebalancing", description: "Automated portfolio optimization" },
    { icon: <PencilLine />, title: "Trade Journal", description: "Track and analyze your trades" },
    { icon: <LineChart />, title: "Market Alerts", description: "Real-time market notifications" },
    { icon: <Users />, title: "Social Trading", description: "Learn from successful traders" },
    { icon: <Shield />, title: "Enterprise Security", description: "Bank-grade encryption" },
    { icon: <BookOpen />, title: "Educational Hub", description: "Comprehensive learning resources" }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Professional Trader",
      content: "ProfitWise AI has transformed how I analyze market opportunities. The AI insights are incredibly accurate.",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=1"
    },
    {
      name: "Michael Chen",
      role: "Investment Analyst",
      content: "The real-time analytics and portfolio tracking features have become essential to my daily trading routine.",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=2"
    },
    {
      name: "Emma Davis",
      role: "Retail Investor",
      content: "As a beginner, the educational resources and social trading features helped me start investing confidently.",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=3"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary-600" />
            <span className="text-2xl font-bold">ProfitWise AI</span>
          </div>
          <div className="md:flex items-center space-x-6">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden">
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-slate-600 hover:text-primary-600">Features</a>
              <a href="#how-it-works" className="text-slate-600 hover:text-primary-600">How it Works</a>
              <a href="#testimonials" className="text-slate-600 hover:text-primary-600">Testimonials</a>
              <Link href="/auth">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/auth">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
          {/* Mobile Menu */}
          <div className={`md:hidden absolute top-12 right-6 bg-white shadow-md rounded-md p-4 ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
            <ul className="space-y-4">
              <li><a href="#features" className="text-slate-600 hover:text-primary-600">Features</a></li>
              <li><a href="#how-it-works" className="text-slate-600 hover:text-primary-600">How it Works</a></li>
              <li><a href="#testimonials" className="text-slate-600 hover:text-primary-600">Testimonials</a></li>
              <li><Link href="/auth"><Button variant="ghost" size="sm">Login</Button></Link></li>
              <li><Link href="/auth"><Button size="sm">Get Started</Button></Link></li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-900 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.2] bg-[size:20px_20px]" />
        <div className="container mx-auto px-6 py-24 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Transform Your Trading with AI-Powered Intelligence
            </h1>
            <p className="text-xl mb-8 text-white/80">
              ProfitWise AI combines advanced machine learning with real-time market data 
              to help you make smarter investment decisions and maximize returns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth">
                <Button size="lg" className="bg-white text-primary-900 hover:bg-white/90">
                  Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/10"
                onClick={() => setIsVideoPlaying(true)}
              >
                Watch Demo
              </Button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative hidden md:block"
          >
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary-600/30 to-primary-600/10 rounded-3xl backdrop-blur-3xl" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4/5 h-4/5 bg-primary-700/50 rounded-2xl flex items-center justify-center">
                  <BarChart className="w-1/2 h-1/2 text-white/80" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <SubscriptionPlans />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600">$2.5B+</div>
              <div className="text-slate-600">Assets Managed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600">50K+</div>
              <div className="text-slate-600">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600">95%</div>
              <div className="text-slate-600">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600">24/7</div>
              <div className="text-slate-600">Market Analysis</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose ProfitWise AI</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Our platform combines cutting-edge technology with user-friendly features
              to give you the edge in today's markets.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-primary-600">{feature.icon}</div>
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How ProfitWise AI Works</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Get started in minutes and let our AI-powered platform do the heavy lifting.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: <Users />, title: "Create Account", description: "Sign up in seconds" },
              { icon: <CircleDollarSign />, title: "Connect Assets", description: "Link your portfolios" },
              { icon: <Brain />, title: "AI Analysis", description: "Get personalized insights" },
              { icon: <TrendingUp />, title: "Start Trading", description: "Execute with confidence" }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-primary-100 rounded-full flex items-center justify-center">
                  <div className="text-primary-600">{step.icon}</div>
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">What Our Users Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="bg-white p-6 rounded-lg shadow-sm"
              >
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full mb-4"
                />
                <p className="text-slate-600 mb-4">{testimonial.content}</p>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-slate-500">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-900 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of successful investors who are already using ProfitWise AI
            to transform their trading strategy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <Button size="lg" className="bg-white text-primary-900 hover:bg-white/90">
                Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Schedule Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-6 w-6" />
                <span className="text-xl font-bold">ProfitWise AI</span>
              </div>
              <p className="text-slate-400">
                Making investment decisions smarter with artificial intelligence.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li>Features</li>
                <li>Pricing</li>
                <li>Security</li>
                <li>Roadmap</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-slate-400">
                <li>Documentation</li>
                <li>Blog</li>
                <li>Support</li>
                <li>API</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li>About</li>
                <li>Careers</li>
                <li>Contact</li>
                <li>Partners</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; {new Date().getFullYear()} ProfitWise AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}