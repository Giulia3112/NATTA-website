import { Link } from "wouter";
import { Globe, Users, Zap, Heart } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container py-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/natta-logo.png" alt="NATTA" className="h-8" />
          </Link>
        </div>
      </div>

      <div className="container py-16">
        {/* Hero */}
        <div className="max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl font-bold mb-6 text-gray-900">
            About <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">NATTA</span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            NATTA is more than a search tool. It's more than an application manager. <strong>NATTA is the platform that believes in you.</strong>
          </p>
        </div>

        {/* Mission Section */}
        <div className="grid md:grid-cols-2 gap-12 mb-16 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-900">Our Mission</h2>
            <p className="text-lg text-gray-600 mb-4">
              Transform overlooked talent into competitive candidates. We believe geography should not determine your opportunities.
            </p>
            <p className="text-lg text-gray-600 mb-4">
              We built NATTA for emerging markets — especially Brazil, India, Africa, and underserved Asia — because we know extraordinary talent exists everywhere.
            </p>
            <p className="text-lg text-gray-600">
              Our goal is to expand access to top global opportunities by removing barriers to discovery and management.
            </p>
          </div>
          <div className="bg-white rounded-xl p-8 border border-gray-200">
            <div className="space-y-6">
              <div className="flex gap-4">
                <Globe className="w-8 h-8 text-blue-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-lg mb-2">Global, Accessible</h3>
                  <p className="text-gray-600">Opportunities from around the world, in one place</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Users className="w-8 h-8 text-blue-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-lg mb-2">Built for You</h3>
                  <p className="text-gray-600">Designed for emerging market candidates</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Zap className="w-8 h-8 text-blue-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-lg mb-2">Smart</h3>
                  <p className="text-gray-600">AI-powered discovery and smarter management</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* The Problem */}
        <div className="bg-white rounded-xl p-12 border border-gray-200 mb-16">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">The Problem</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <p className="text-gray-600 mb-4">
                <strong>Fragmented Discovery:</strong> Opportunities are scattered across dozens of different platforms. You spend hours searching.
              </p>
            </div>
            <div>
              <p className="text-gray-600 mb-4">
                <strong>Chaotic Management:</strong> Spreadsheets, emails, notes. No clear view of your deadlines and status.
              </p>
            </div>
            <div>
              <p className="text-gray-600 mb-4">
                <strong>Invisible Conflicts:</strong> You accept two overlapping opportunities. Nobody warns you.
              </p>
            </div>
          </div>
        </div>

        {/* The Solution */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">Our Solution</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-8 border border-blue-200">
              <h3 className="text-xl font-bold mb-4 text-gray-900">Discovery</h3>
              <p className="text-gray-600">
                Search 15,000+ opportunities with advanced filters. Find exactly what you're looking for in seconds.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-8 border border-blue-200">
              <h3 className="text-xl font-bold mb-4 text-gray-900">Management</h3>
              <p className="text-gray-600">
                Organize your applications in an intuitive Kanban. Track documents, notes, and status in one place.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-8 border border-blue-200">
              <h3 className="text-xl font-bold mb-4 text-gray-900">Protection</h3>
              <p className="text-gray-600">
                Smart calendar with automatic conflict detection. Never accept two overlapping opportunities again.
              </p>
            </div>
          </div>
        </div>

        {/* What is a Competitive Candidate */}
        <div className="bg-blue-50 rounded-xl p-12 border border-blue-200 mb-16">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">What is a Competitive Candidate?</h2>
          <p className="text-lg text-gray-600 mb-6">
            It's not just having a good resume. It's being <strong>strategically positioned</strong> for the opportunities that matter.
          </p>
          <ul className="space-y-4">
            <li className="flex gap-4">
              <span className="text-blue-600 font-bold">✓</span>
              <span className="text-gray-600">Knows the right opportunities for your profile</span>
            </li>
            <li className="flex gap-4">
              <span className="text-blue-600 font-bold">✓</span>
              <span className="text-gray-600">Manages your deadlines and applications with precision</span>
            </li>
            <li className="flex gap-4">
              <span className="text-blue-600 font-bold">✓</span>
              <span className="text-gray-600">Avoids conflicts and makes informed decisions</span>
            </li>
            <li className="flex gap-4">
              <span className="text-blue-600 font-bold">✓</span>
              <span className="text-gray-600">Maximizes your chances of success</span>
            </li>
          </ul>
        </div>

        {/* Status */}
        <div className="bg-white rounded-xl p-12 border border-gray-200 mb-16">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">Platform Status</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-green-600">✓ Available Now (Web)</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Opportunity search with advanced filters</li>
                <li>• Application management dashboard</li>
                <li>• Kanban with application status</li>
                <li>• Calendar with conflict detection</li>
                <li>• Secure authentication</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 text-blue-600">🚀 In Development (Mobile)</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Native iOS app</li>
                <li>• Native Android app</li>
                <li>• Push notifications for deadlines</li>
                <li>• Offline-first for better experience</li>
                <li>• Automatic synchronization</li>
              </ul>
            </div>
          </div>
          <p className="text-gray-600 mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <strong>Join early access:</strong> Be one of the first to use the mobile app when it launches. Your feedback will shape the platform's future.
          </p>
        </div>

        {/* Markets We Serve */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">Markets We Serve</h2>
          <p className="text-lg text-gray-600 mb-8">
            NATTA was built with a focus on emerging markets, but offers global opportunities for everyone.
          </p>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
              <p className="text-2xl mb-2">🇧🇷</p>
              <h3 className="font-bold mb-2">Brazil</h3>
              <p className="text-sm text-gray-600">Access to global scholarships and programs</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
              <p className="text-2xl mb-2">🇮🇳</p>
              <h3 className="font-bold mb-2">India</h3>
              <p className="text-sm text-gray-600">Opportunities for Indian talent</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
              <p className="text-2xl mb-2">🌍</p>
              <h3 className="font-bold mb-2">Africa</h3>
              <p className="text-sm text-gray-600">Programs for African leaders</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
              <p className="text-2xl mb-2">🌏</p>
              <h3 className="font-bold mb-2">Asia</h3>
              <p className="text-sm text-gray-600">Opportunities across the region</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-lg text-gray-600 mb-8">Join thousands of candidates transforming their careers.</p>
          <Link href="/opportunities">
            <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 ease-in-out">
              Explore Opportunities
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
