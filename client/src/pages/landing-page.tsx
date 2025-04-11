
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, BarChart, Brain, Shield } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <header className="bg-gradient-to-br from-primary-900 to-primary-800 text-white">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold">ProfitWise AI</div>
          <div className="space-x-4">
            <Link href="/auth">
              <Button variant="ghost" className="text-white hover:text-white">Login</Button>
            </Link>
            <Link href="/auth">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>
        
        <div className="container mx-auto px-6 py-24">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6">
              Smart Investment Decisions with AI
            </h1>
            <p className="text-xl mb-8 text-white/80">
              ProfitWise AI combines advanced analytics with artificial intelligence 
              to help you make data-driven investment decisions.
            </p>
            <Link href="/auth">
              <Button size="lg" className="bg-white text-primary-900 hover:bg-white/90">
                Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">Why Choose ProfitWise AI</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-primary-100 rounded-full flex items-center justify-center">
                <Brain className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">AI-Powered Insights</h3>
              <p className="text-slate-600">
                Get personalized investment recommendations backed by advanced machine learning algorithms.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-primary-100 rounded-full flex items-center justify-center">
                <BarChart className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Advanced Analytics</h3>
              <p className="text-slate-600">
                Track your portfolio performance with real-time analytics and detailed reporting.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-primary-100 rounded-full flex items-center justify-center">
                <Shield className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Security First</h3>
              <p className="text-slate-600">
                Your investments are protected with enterprise-grade security and encryption.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-slate-50 py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Investing Smarter?</h2>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            Join thousands of investors who are already using ProfitWise AI to optimize their portfolios.
          </p>
          <Link href="/auth">
            <Button size="lg">
              Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">ProfitWise AI</h3>
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
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-slate-400">
                <li>Documentation</li>
                <li>Blog</li>
                <li>Support</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Contact</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
