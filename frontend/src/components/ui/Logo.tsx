import React from "react";
import assets from "@/assets/image/assets";

const Logo: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  return (
    <div className="relative w-13 h-13">
      <img
        src={assets.logo}
        alt="logo clair"
        className={`absolute top-0 left-0$ {
          isDark ? "opacity-0" : "opacity-100"
        }`}
      />
      <img
        src={assets.logo_dark}
        alt="logo sombre"
        className={`absolute top-0 left-0 ${
          isDark ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
};

export default Logo;
