import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { SECTORS, SECTOR_COLORS } from "../data/sectorsData";
import SectorTabs from "../components/SectorTabs";
import SectorStats from "../components/SectorStats";
import {
  getReadOnlyContract,
  getTotalNFTsMinted,
} from "../utils/contractHelper";

// ============================================
// Fetch real records from blockchain
// ============================================
async function fetchRealRecords(sectorKey) {
  try {
    const contract = await getReadOnlyContract(sectorKey);
    const ids = await contract.getAllIds();

    if (!ids || ids.length === 0) return [];

    const lastIds = ids.slice(-5).reverse();

    const records = await Promise.all(
      lastIds.map(async (id) => {
        try {
          const result = await contract.verify(id);
          let record;

          if (sectorKey === "education") {
            record = {
              id,
              holder: result[0],
              type: result[1],
              date: new Date(Number(result[3]) * 1000).toLocaleDateString(
                "en-IN",
                { year: "numeric", month: "short", day: "numeric" }
              ),
              status: result[4] ? "verified" : "revoked",
            };
          } else if (sectorKey === "government") {
            record = {
              id,
              holder: result[0],
              type: result[1],
              date: new Date(Number(result[3]) * 1000).toLocaleDateString(
                "en-IN",
                { year: "numeric", month: "short", day: "numeric" }
              ),
              status: result[4] ? "verified" : "revoked",
            };
          } else if (sectorKey === "healthcare") {
            record = {
              id,
              holder: result[0],
              type: result[1],
              date: new Date(Number(result[4]) * 1000).toLocaleDateString(
                "en-IN",
                { year: "numeric", month: "short", day: "numeric" }
              ),
              status: result[5] ? "verified" : "revoked",
            };
          } else if (sectorKey === "land") {
            record = {
              id,
              holder: result[0],
              type: result[1],
              date: new Date(Number(result[4]) * 1000).toLocaleDateString(
                "en-IN",
                { year: "numeric", month: "short", day: "numeric" }
              ),
              status: result[5] ? "verified" : "revoked",
            };
          }

          return record;
        } catch (err) {
          console.error(`Error fetching record ${id} (${sectorKey}):`, err);
          return null;
        }
      })
    );

    return records.filter(Boolean);
  } catch (err) {
    console.warn(`Failed to fetch records for ${sectorKey}:`, err.message);
    return [];
  }
}

// ============================================
// Fetch real stats from blockchain
// ============================================
async function fetchRealStats(sectorKey) {
  try {
    const contract = await getReadOnlyContract(sectorKey);
    const total = Number(await contract.total());

    let revoked = 0;
    try {
      revoked = Number(await contract.revokedCount());
    } catch {
      revoked = 0;
    }

    const stats = {
      total,
      verified: total - revoked,
      revoked,
    };

    // For education only: add NFT count
    if (sectorKey === "education") {
      try {
        stats.nftCount = await getTotalNFTsMinted();
      } catch {
        stats.nftCount = 0;
      }
    }

    return stats;
  } catch (err) {
    console.warn(`Stats error for ${sectorKey}:`, err.message);
    return { total: 0, verified: 0, revoked: 0 };
  }
}

export default function Dashboard() {
  const [activeSector, setActiveSector] = useState("education");
  const [realStats, setRealStats] = useState({});
  const [realRecords, setRealRecords] = useState({});
  const [loading, setLoading] = useState(true);
  const sector = SECTORS[activeSector];
  const colors = SECTOR_COLORS[sector.color];

  // ============================================
  // Initial fetch — all sectors
  // ============================================
  useEffect(() => {
    async function fetchAllData() {
      try {
        setLoading(true);
        const stats = {};
        const records = {};

        for (const sectorKey of [
          "education",
          "government",
          "healthcare",
          "land",
        ]) {
          stats[sectorKey] = await fetchRealStats(sectorKey);
          records[sectorKey] = await fetchRealRecords(sectorKey);
        }

        setRealStats(stats);
        setRealRecords(records);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAllData();
  }, []);

  // ============================================
  // Refresh on sector change
  // ============================================
  async function refreshSector(sectorKey) {
    try {
      const records = await fetchRealRecords(sectorKey);
      const stats = await fetchRealStats(sectorKey);

      setRealStats((prev) => ({ ...prev, [sectorKey]: stats }));
      setRealRecords((prev) => ({ ...prev, [sectorKey]: records }));
    } catch (err) {
      console.warn("Refresh error:", err.message);
    }
  }

  const displaySector = {
    ...sector,
    stats: realStats[sector.id] || { total: 0, verified: 0, revoked: 0 },
  };

  const currentRecords = realRecords[sector.id] || [];

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8">
      {/* Header */}
      <div className="mb-8 animate-slide-up">
        <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200 mb-4">
          <span className="live-dot"></span>
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            Multi-Sector Dashboard
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">
          Satya-Chain{" "}
          <span className="gradient-text">Unified Dashboard</span>
        </h1>
        <p className="text-lg text-slate-600">
          One blockchain — multiple sectors, infinite trust
        </p>
      </div>

      {/* Sector Tabs */}
      <div className="mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <SectorTabs
          activeSector={activeSector}
          onSectorChange={(s) => {
            setActiveSector(s);
            refreshSector(s);
          }}
        />
      </div>

      {/* Sector Info */}
      <div
        className={`card mb-6 ${colors.bg} border ${colors.border} animate-slide-up`}
        style={{ animationDelay: "0.2s" }}
      >
        <div className="flex items-center gap-4 flex-wrap">
          <div
            className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center text-3xl shadow-lg`}
          >
            {sector.icon}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">
              {sector.name}
            </h2>
            <p className="text-slate-600">{sector.description}</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link
              to={`/university?sector=${sector.id}`}
              className="btn-primary"
            >
              📝 {sector.issueLabel}
            </Link>
            <Link to={`/verify?sector=${sector.id}`} className="btn-secondary">
              🔍 {sector.verifyLabel}
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 animate-slide-up" style={{ animationDelay: "0.3s" }}>
        <SectorStats sector={displaySector} />
      </div>

      {/* Recent Activity */}
      <div className="card animate-slide-up" style={{ animationDelay: "0.4s" }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>📋</span> Recent {sector.recordLabel}
          </h3>
          <span
            className={`${colors.badge} px-3 py-1 rounded-full text-xs font-semibold`}
          >
            Last 5
          </span>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-600 font-medium">
              Loading records from blockchain...
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && currentRecords.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 animate-float">📭</div>
            <h4 className="text-xl font-bold text-slate-700 mb-2">
              No {sector.recordLabel} yet
            </h4>
            <p className="text-slate-500 mb-6">
              Be the first to issue a record in {sector.name}
            </p>
            <Link
              to={`/university?sector=${sector.id}`}
              className="btn-primary inline-flex"
            >
              📝 Issue First Record
            </Link>
          </div>
        )}

        {/* Records */}
        {!loading && currentRecords.length > 0 && (
          <div className="space-y-3">
            {currentRecords.map((record, index) => (
              <Link
                key={record.id}
                to={`/verify/${record.id}?sector=${sector.id}`}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colors.gradient} flex items-center justify-center text-white text-sm font-bold shadow-md flex-shrink-0`}
                  >
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-900 truncate">
                      {record.holder}
                    </div>
                    <div className="text-sm text-slate-500 truncate">
                      {record.type}
                    </div>
                  </div>
                </div>

                <div className="text-right flex items-center gap-4 flex-shrink-0">
                  <div className="hidden md:block">
                    <div className="text-xs text-slate-400 font-mono">
                      {record.id}
                    </div>
                    <div className="text-xs text-slate-400">{record.date}</div>
                  </div>
                  <span
                    className={
                      record.status === "verified"
                        ? "badge-success"
                        : "badge-danger"
                    }
                  >
                    {record.status === "verified" ? "✓ Verified" : "✗ Revoked"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Info Note */}
      <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-3 animate-fade-in">
        <span className="text-xl">✅</span>
        <p className="text-sm text-emerald-900 leading-relaxed">
          <strong>Live Data:</strong> All stats and records above are fetched
          directly from the blockchain in real-time. Every record you issue is
          permanently stored and verifiable.
        </p>
      </div>
    </div>
  );
}