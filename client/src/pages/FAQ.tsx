import { useState } from "react";
import { Link } from "wouter";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Is NATTA free?",
    answer: "Early access will be included with free and premium plans. We are committed to making opportunity discovery accessible to everyone.",
  },
  {
    question: "Is the mobile app available yet?",
    answer: "No, the mobile app is in development. You can use the complete web version now. Join early access to be notified when the app launches.",
  },
  {
    question: "Which countries do you support?",
    answer: "We offer global opportunities for candidates from around the world. We have special focus on Brazil, India, Africa, and underserved Asia, but the platform is accessible globally.",
  },
  {
    question: "How does calendar conflict detection work?",
    answer: "When you add an accepted opportunity to your calendar, the system automatically checks if there's overlap with other accepted opportunities. If there's a conflict, you'll receive a warning.",
  },
  {
    question: "Can I save documents and drafts?",
    answer: "Yes! You can manage documents and application drafts in your dashboard. This functionality is available in the web version.",
  },
  {
    question: "How do I apply to an opportunity?",
    answer: "Find the opportunity in the search, click 'View Details', and then click 'Add to My Applications'. You can track the status in your dashboard.",
  },
  {
    question: "Is my data secure?",
    answer: "Yes. We use end-to-end encryption and compliance with LGPD/GDPR. Your data is never shared with third parties without your permission.",
  },
  {
    question: "Can I integrate with other platforms?",
    answer: "We are working on integrations with popular platforms. For now, you can export your applications as CSV.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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
          <h1 className="text-5xl font-bold mb-4 text-gray-900">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600 mb-12">
            Find answers to the most common questions about NATTA.
          </p>

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
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Didn't find your question?</h2>
            <p className="text-gray-600 mb-6">Contact us and we'll be happy to help.</p>
            <a
              href="mailto:support@aiply.com"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 ease-in-out"
            >
              Send Message
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
