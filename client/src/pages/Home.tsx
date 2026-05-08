import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CheckCircle, Search, Calendar, Zap, Sparkles, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

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
              {t("nav.opportunities")}
            </Link>
            {isAuthenticated && (
              <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 transition-all duration-300 ease-in-out">
                {t("nav.dashboard")}
              </Link>
            )}
            {isAuthenticated ? (
              <Link href="/profile" className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 ease-in-out">
                {t("nav.profile")}
              </Link>
            ) : (
              <Link href="/login" className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 ease-in-out">
                {t("nav.signIn")}
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
              {t("home.badge")}
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              {t("home.hero.title")}{" "}
              <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                {t("home.hero.titleHighlight")}
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">{t("home.hero.subtitle")}</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/opportunities">
                <Button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 ease-in-out">
                  {t("home.hero.exploreBtn")}
                </Button>
              </Link>
              <Link href="/opportunities">
                <Button variant="outline" className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-300 ease-in-out flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  {t("home.hero.aiSearchBtn")}
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
                      <p className="font-semibold text-gray-900">{t("home.features.discover.title")}</p>
                      <p className="text-sm text-gray-600">{t("home.features.discover.subtitle")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{t("home.features.manage.title")}</p>
                      <p className="text-sm text-gray-600">{t("home.features.manage.subtitle")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{t("home.features.detect.title")}</p>
                      <p className="text-sm text-gray-600">{t("home.features.detect.subtitle")}</p>
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
          <p className="text-3xl md:text-4xl font-bold text-gray-900">
            {t("home.social.text")}{" "}
            <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              {t("home.social.highlight")}
            </span>
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="container py-20">
        <h2 className="text-4xl font-bold text-center mb-12">{t("home.howItWorks.title")}</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-8 border border-gray-100 hover:shadow-lg transition-all duration-300 ease-in-out">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">{t("home.howItWorks.discover.title")}</h3>
            <p className="text-gray-600">{t("home.howItWorks.discover.body")}</p>
          </div>
          <div className="bg-white rounded-xl p-8 border border-gray-100 hover:shadow-lg transition-all duration-300 ease-in-out">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">{t("home.howItWorks.organize.title")}</h3>
            <p className="text-gray-600">{t("home.howItWorks.organize.body")}</p>
          </div>
          <div className="bg-white rounded-xl p-8 border border-gray-100 hover:shadow-lg transition-all duration-300 ease-in-out">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">{t("home.howItWorks.track.title")}</h3>
            <p className="text-gray-600">{t("home.howItWorks.track.body")}</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gradient-to-br from-blue-50 to-white py-20 border-t border-gray-200">
        <div className="container">
          <h2 className="text-4xl font-bold text-center mb-12">{t("home.keyFeatures.title")}</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg mb-2">{t("home.keyFeatures.search.title")}</h3>
                <p className="text-gray-600">{t("home.keyFeatures.search.body")}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg mb-2">{t("home.keyFeatures.kanban.title")}</h3>
                <p className="text-gray-600">{t("home.keyFeatures.kanban.body")}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg mb-2">{t("home.keyFeatures.calendar.title")}</h3>
                <p className="text-gray-600">{t("home.keyFeatures.calendar.body")}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg mb-2">{t("home.keyFeatures.emerging.title")}</h3>
                <p className="text-gray-600">{t("home.keyFeatures.emerging.body")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20 text-center">
        <h2 className="text-4xl font-bold mb-6">{t("home.cta.title")}</h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">{t("home.cta.subtitle")}</p>
        {isAuthenticated ? (
          <Link href="/opportunities">
            <Button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 ease-in-out">
              {t("home.cta.exploreBtn")}
            </Button>
          </Link>
        ) : (
          <Link href="/login">
            <Button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 ease-in-out">
              {t("home.cta.startBtn")}
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
              <p className="text-sm">{t("home.footer.tagline")}</p>
            </div>
            <div>
              <p className="text-white font-bold mb-4">{t("home.footer.product")}</p>
              <ul className="space-y-2 text-sm">
                <li><Link href="/opportunities" className="hover:text-white transition">{t("nav.opportunities")}</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition">{t("nav.dashboard")}</Link></li>
                <li><Link href="/about" className="hover:text-white transition">{t("nav.about")}</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-white font-bold mb-4">{t("home.footer.company")}</p>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white transition">{t("home.footer.aboutUs")}</Link></li>
                <li><Link href="/faq" className="hover:text-white transition">{t("nav.faq")}</Link></li>
                <li><a href="mailto:Contato@natta.pro" className="hover:text-white transition">{t("nav.contact")}</a></li>
              </ul>
            </div>
            <div>
              <p className="text-white font-bold mb-4">{t("home.footer.legal")}</p>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">{t("home.footer.privacy")}</a></li>
                <li><a href="#" className="hover:text-white transition">{t("home.footer.terms")}</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>{t("home.footer.rights")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
