import { useState } from "react";
import { Link } from "wouter";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { t } = useTranslation();

  const faqs = Array.from({ length: 8 }, (_, i) => ({
    question: t(`faq.q${i}q`),
    answer: t(`faq.q${i}a`),
  }));

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold mb-4 text-gray-900">{t("faq.title")}</h1>
          <p className="text-xl text-gray-600 mb-12">{t("faq.subtitle")}</p>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 ease-in-out"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-all duration-300 ease-in-out"
                >
                  <h3 className="text-lg font-semibold text-gray-900 text-left">{faq.question}</h3>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-600 transition-transform duration-300 ease-in-out ${
                      openIndex === index ? "transform rotate-180" : ""
                    }`}
                  />
                </button>
                {openIndex === index && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="mt-16 bg-blue-50 rounded-xl p-8 border border-blue-200 text-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">{t("faq.noQuestion")}</h2>
            <p className="text-gray-600 mb-6">{t("faq.contactBody")}</p>
            <a
              href="mailto:Contato@natta.pro"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 ease-in-out"
            >
              {t("faq.sendMessage")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
