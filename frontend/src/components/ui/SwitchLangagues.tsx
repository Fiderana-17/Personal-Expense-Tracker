import { useState } from "react";
import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SwitchLangaguesProps {
  initial?: "FR" | "EN";
}

const SwitchLangagues: React.FC<SwitchLangaguesProps> = ({ initial = "EN" }) => {
  const [lang, setLang] = useState<"FR" | "EN">(initial);
  const { i18n } = useTranslation();

  const toggle = () => {
    const next = lang === "FR" ? "EN" : "FR";
    setLang(next);
    i18n.changeLanguage(next.toLowerCase());
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={`relative w-18 h-9 rounded-full transition-colors duration-300 ${
        lang === "EN" ? "bg-blue-700" : "bg-blue-900"
      }`}
    >
      <span
        className={`absolute top-1 left-1 w-7 h-7 bg-white rounded-full shadow-md transition-transform duration-300 flex items-center justify-center ${
          lang === "FR" ? "translate-x-8.5" : ""
        }`}
      >
        <Languages className="w-4 h-4" />
      </span>

      <span
        className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-semibold text-white ml-4 ${
          lang === "EN" ? "opacity-100" : "opacity-0 duration-700"
        }`}
      >
        EN
      </span>
      <span
        className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-semibold text-white -ml-4 ${
          lang === "FR" ? "opacity-100" : "opacity-0 duration-700"
        }`}
      >
        FR
      </span>
    </button>
  );
};

export default SwitchLangagues;
