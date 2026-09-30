import React from "react";

export const SECTORS = [
  {
    id: "education",
    name: "Education",
    icon: "🎓",
    badge: "Soulbound NFT (ERC-5192)",
    color: "indigo",
    accent: "from-indigo-600 to-purple-600",
  },
  {
    id: "government",
    name: "Government IDs",
    icon: "🆔",
    badge: "On-Chain Registry",
    color: "cyan",
    accent: "from-cyan-600 to-blue-600",
  },
  {
    id: "land",
    name: "Land Registry",
    icon: "🏠",
    badge: "Transferable NFT (ERC-721)",
    color: "amber",
    accent: "from-amber-600 to-orange-600",
  },
  {
    id: "healthcare",
    name: "Healthcare",
    icon: "🏥",
    badge: "Patient-Controlled ACL",
    color: "emerald",
    accent: "from-emerald-600 to-teal-600",
  },
];

export default function SectorSwitcher({ activeSector, onSelectSector }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2.5 p-2 bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-200/90 shadow-soft-md max-w-4xl mx-auto my-6">
      {SECTORS.map((s) => {
        const isActive = activeSector === s.id;
        return (
          <button
            key={s.id}
            onClick={() => onSelectSector(s.id)}
            className={`flex items-center gap-2.5 px-4 sm:px-5 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
              isActive
                ? `bg-gradient-to-r ${s.accent} text-white shadow-lg shadow-indigo-600/20 scale-[1.02]`
                : "bg-slate-50/70 hover:bg-white text-slate-700 hover:text-slate-950 border border-slate-200/60 hover:border-slate-300"
            }`}
          >
            <span className="text-xl sm:text-2xl drop-shadow-sm">{s.icon}</span>
            <div className="text-left">
              <div className={`font-bold leading-tight ${isActive ? "text-white" : "text-slate-900"}`}>
                {s.name}
              </div>
              <div className={`text-[11px] font-medium ${isActive ? "text-white/90" : "text-slate-500"}`}>
                {s.badge}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
