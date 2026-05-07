import { useTranslation } from "react-i18next";

export default function LanguageToggle() {
  const { i18n } = useTranslation();
  const isEN = i18n.language === "en";

  const toggle = () => {
    const next = isEN ? "pt" : "en";
    i18n.changeLanguage(next);
    localStorage.setItem("natta_lang", next);
  };

  return (
    <button
      onClick={toggle}
      title={isEN ? "Mudar para Português" : "Switch to English"}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-300 bg-white hover:bg-gray-50 text-sm font-semibold text-gray-700 transition-all duration-200 shadow-sm hover:shadow"
    >
      <span className="text-base leading-none">{isEN ? "🇧🇷" : "🇺🇸"}</span>
      <span>{isEN ? "PT" : "EN"}</span>
    </button>
  );
}
