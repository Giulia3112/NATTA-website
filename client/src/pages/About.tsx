import { Link } from "wouter";
import { Globe, Users, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function About() {
  const { t } = useTranslation();

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
            {t("about.title")}{" "}
            <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              {t("about.titleHighlight")}
            </span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            {t("about.introPart1")}
            <strong>{t("about.introBold")}</strong>
          </p>
        </div>

        {/* Mission Section */}
        <div className="grid md:grid-cols-2 gap-12 mb-16 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-900">{t("about.missionTitle")}</h2>
            <p className="text-lg text-gray-600 mb-4">{t("about.missionP1")}</p>
            <p className="text-lg text-gray-600 mb-4">{t("about.missionP2")}</p>
            <p className="text-lg text-gray-600">{t("about.missionP3")}</p>
          </div>
          <div className="bg-white rounded-xl p-8 border border-gray-200">
            <div className="space-y-6">
              <div className="flex gap-4">
                <Globe className="w-8 h-8 text-blue-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-lg mb-2">{t("about.globalTitle")}</h3>
                  <p className="text-gray-600">{t("about.globalBody")}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Users className="w-8 h-8 text-blue-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-lg mb-2">{t("about.builtTitle")}</h3>
                  <p className="text-gray-600">{t("about.builtBody")}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Zap className="w-8 h-8 text-blue-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-lg mb-2">{t("about.smartTitle")}</h3>
                  <p className="text-gray-600">{t("about.smartBody")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* The Problem */}
        <div className="bg-white rounded-xl p-12 border border-gray-200 mb-16">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">{t("about.problemTitle")}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <p className="text-gray-600 mb-4">
                <strong>{t("about.fragmentedTitle")}</strong> {t("about.fragmentedBody")}
              </p>
            </div>
            <div>
              <p className="text-gray-600 mb-4">
                <strong>{t("about.chaoticTitle")}</strong> {t("about.chaoticBody")}
              </p>
            </div>
            <div>
              <p className="text-gray-600 mb-4">
                <strong>{t("about.invisibleTitle")}</strong> {t("about.invisibleBody")}
              </p>
            </div>
          </div>
        </div>

        {/* The Solution */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">{t("about.solutionTitle")}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-8 border border-blue-200">
              <h3 className="text-xl font-bold mb-4 text-gray-900">{t("about.discoveryTitle")}</h3>
              <p className="text-gray-600">{t("about.discoveryBody")}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-8 border border-blue-200">
              <h3 className="text-xl font-bold mb-4 text-gray-900">{t("about.managementTitle")}</h3>
              <p className="text-gray-600">{t("about.managementBody")}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-8 border border-blue-200">
              <h3 className="text-xl font-bold mb-4 text-gray-900">{t("about.protectionTitle")}</h3>
              <p className="text-gray-600">{t("about.protectionBody")}</p>
            </div>
          </div>
        </div>

        {/* What is a Competitive Candidate */}
        <div className="bg-blue-50 rounded-xl p-12 border border-blue-200 mb-16">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">{t("about.competitiveTitle")}</h2>
          <p className="text-lg text-gray-600 mb-6">
            {t("about.competitiveIntroPart1")}
            <strong>{t("about.competitiveIntroBold")}</strong>
            {t("about.competitiveIntroPart2")}
          </p>
          <ul className="space-y-4">
            {(["competitiveItem1", "competitiveItem2", "competitiveItem3", "competitiveItem4"] as const).map((key) => (
              <li key={key} className="flex gap-4">
                <span className="text-blue-600 font-bold">✓</span>
                <span className="text-gray-600">{t(`about.${key}`)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Status */}
        <div className="bg-white rounded-xl p-12 border border-gray-200 mb-16">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">{t("about.statusTitle")}</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-green-600">{t("about.availableNow")}</h3>
              <ul className="space-y-2 text-gray-600">
                {(["avail1", "avail2", "avail3", "avail4", "avail5"] as const).map((key) => (
                  <li key={key}>• {t(`about.${key}`)}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 text-blue-600">{t("about.inDev")}</h3>
              <ul className="space-y-2 text-gray-600">
                {(["dev1", "dev2", "dev3", "dev4", "dev5"] as const).map((key) => (
                  <li key={key}>• {t(`about.${key}`)}</li>
                ))}
              </ul>
            </div>
          </div>
          <p className="text-gray-600 mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <strong>{t("about.earlyAccessPart1")}</strong>
            {t("about.earlyAccessPart2")}
          </p>
        </div>

        {/* Markets We Serve */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">{t("about.marketsTitle")}</h2>
          <p className="text-lg text-gray-600 mb-8">{t("about.marketsBody")}</p>
          <div className="grid md:grid-cols-4 gap-6">
            {(["brazil", "india", "africa", "asia"] as const).map((m, i) => (
              <div key={m} className="bg-white rounded-xl p-6 border border-gray-200 text-center">
                <p className="text-2xl mb-2">{["🇧🇷", "🇮🇳", "🌍", "🌏"][i]}</p>
                <h3 className="font-bold mb-2">{t(`about.${m}Name`)}</h3>
                <p className="text-sm text-gray-600">{t(`about.${m}Desc`)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">{t("about.ctaTitle")}</h2>
          <p className="text-lg text-gray-600 mb-8">{t("about.ctaBody")}</p>
          <Link href="/opportunities">
            <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 ease-in-out">
              {t("about.ctaBtn")}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
