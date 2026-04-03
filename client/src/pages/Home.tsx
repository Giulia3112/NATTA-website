import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CheckCircle, Search, Calendar, Zap, Globe, Users } from "lucide-react";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="container flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/natta-logo.png" alt="NATTA" className="h-8" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/opportunities" className="text-gray-600 hover:text-blue-600 transition-all duration-300 ease-in-out">
              Opportunities
            </Link>
            {isAuthenticated && (
              <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 transition-all duration-300 ease-in-out">
                Dashboard
              </Link>
            )}
            {isAuthenticated ? (
              <Link href="/profile" className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 ease-in-out">
                Profile
              </Link>
            ) : (
              <Link href="/login" className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 ease-in-out">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-6">
              🚀 Mobile app coming soon
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Become a <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">Competitive Candidate</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              AI-powered platform to discover global opportunities and manage your applications in one place. Focused in emerging markets made for rising talents.
            </p>
            <div className="flex gap-4">
              <Link href="/opportunities">
                <Button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 ease-in-out">
                  Explore Opportunities
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-300 ease-in-out">
                  How It Works
                </Button>
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl blur-3xl opacity-20"></div>
              <div className="relative bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Search className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Discover Opportunities</p>
                      <p className="text-sm text-gray-600">Advanced filters to find exactly what you need</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Manage Applications</p>
                      <p className="text-sm text-gray-600">Track everything in an intuitive dashboard</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Zap className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Detect Conflicts</p>
                      <p className="text-sm text-gray-600">Automatic alerts for conflicting dates</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-white border-t border-gray-200 py-12">
        <div className="container text-center">
          <p className="text-gray-600 mb-6">Trusted by ambitious candidates worldwide</p>
          <p className="text-3xl md:text-4xl font-bold text-gray-900">
            Looking for <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">thousands of opportunities</span>
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="container py-20">
        <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-8 border border-gray-100 hover:shadow-lg transition-all duration-300 ease-in-out">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">Discover</h3>
            <p className="text-gray-600">
              Search opportunities with advanced filters by type, location, deadline, and field.
            </p>
          </div>
          <div className="bg-white rounded-xl p-8 border border-gray-100 hover:shadow-lg transition-all duration-300 ease-in-out">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">Organize</h3>
            <p className="text-gray-600">
              Manage your documents and drafts in one place, ready for applications.
            </p>
          </div>
          <div className="bg-white rounded-xl p-8 border border-gray-100 hover:shadow-lg transition-all duration-300 ease-in-out">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">Track</h3>
            <p className="text-gray-600">
              Monitor deadlines and automatically detect date conflicts in your calendar.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gradient-to-br from-blue-50 to-white py-20 border-t border-gray-200">
        <div className="container">
          <h2 className="text-4xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg mb-2">Advanced Opportunity Search</h3>
                <p className="text-gray-600">Sophisticated filters to find exactly what you're looking for</p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg mb-2">Application Dashboard</h3>
                <p className="text-gray-600">Intuitive Kanban to organize your applications by status</p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg mb-2">Smart Calendar</h3>
                <p className="text-gray-600">View deadlines and automatically detect conflicts</p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg mb-2">Built for Emerging Markets</h3>
                <p className="text-gray-600">Focus on Brazil, India, Africa, and underserved Asia</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20 text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to get started?</h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Join thousands of candidates transforming their careers with NATTA.
        </p>
        {isAuthenticated ? (
          <Link href="/opportunities">
            <Button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 ease-in-out">
              Explore Opportunities
            </Button>
          </Link>
        ) : (
          <Link href="/login">
            <Button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 ease-in-out">
              Start Now
            </Button>
          </Link>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <p className="text-white font-bold mb-4">NATTA</p>
              <p className="text-sm">Opportunity platform for emerging market candidates.</p>
            </div>
            <div>
              <p className="text-white font-bold mb-4">Product</p>
              <ul className="space-y-2 text-sm">
                <li><Link href="/opportunities" className="hover:text-white transition">Opportunities</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition">Dashboard</Link></li>
                <li><Link href="/about" className="hover:text-white transition">About</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-white font-bold mb-4">Company</p>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white transition">About Us</Link></li>
                <li><Link href="/faq" className="hover:text-white transition">FAQ</Link></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <p className="text-white font-bold mb-4">Legal</p>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2026 NATTA. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
