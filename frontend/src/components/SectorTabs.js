import { SECTOR_LIST, SECTOR_COLORS } from "../data/sectorsData";

export default function SectorTabs({ activeSector, onSectorChange }) {
  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 md:gap-3 p-2 bg-white rounded-2xl shadow-sm border border-slate-200">
        {SECTOR_LIST.map((sector) => {
          const isActive = activeSector === sector.id;
          const colors = SECTOR_COLORS[sector.color];

          return (
            <button
              key={sector.id}
              onClick={() => onSectorChange(sector.id)}
              className={`flex-1 min-w-[140px] flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? `bg-gradient-to-r ${colors.gradient} text-white shadow-lg`
                  : "bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span className="text-2xl">{sector.icon}</span>
              <div className="text-left">
                <div
                  className={`text-sm font-bold ${
                    isActive ? "text-white" : "text-slate-900"
                  }`}
                >
                  {sector.name}
                </div>
                <div
                  className={`text-xs ${
                    isActive ? "text-white/80" : "text-slate-500"
                  }`}
                >
                  {sector.tagline}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}