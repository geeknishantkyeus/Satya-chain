import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  verifyRecord,
  checkIsAdmin,
  revokeRecord,
} from "../utils/contractHelper";
import { getIPFSUrl } from "../utils/ipfs";
import QRCodeModal from "../components/QRCodeModal";
import QRScannerModal from "../components/QRScannerModal";

// ============================================
// SECTOR CONFIG
// ============================================
const SECTORS = {
  education: {
    name: "Education",
    icon: "🎓",
    color: "indigo",
    idLabel: "Certificate ID",
    placeholder: "2024-001",
  },
  government: {
    name: "Government IDs",
    icon: "🆔",
    color: "cyan",
    idLabel: "ID Number",
    placeholder: "AADH-1234-5678",
  },
  healthcare: {
    name: "Healthcare",
    icon: "🏥",
    color: "emerald",
    idLabel: "Record ID",
    placeholder: "HLT-2024-001",
  },
  land: {
    name: "Land & Property",
    icon: "🏠",
    color: "amber",
    idLabel: "Deed ID",
    placeholder: "LAND-2024-001",
  },
};

const COLOR_MAP = {
  indigo: {
    gradient: "from-indigo-500 to-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
  },
  cyan: {
    gradient: "from-cyan-500 to-cyan-600",
    bg: "bg-cyan-50",
    border: "border-cyan-200",
  },
  emerald: {
    gradient: "from-emerald-500 to-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  amber: {
    gradient: "from-amber-500 to-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
};

export default function Verify() {
  const { certId: urlCertId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSector = searchParams.get("sector") || "education";
  const [sector, setSector] = useState(initialSector);
  const config = SECTORS[sector];
  const colors = COLOR_MAP[config.color];

  const [searchId, setSearchId] = useState(urlCertId || "");
  const [cert, setCert] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [revokeStatus, setRevokeStatus] = useState("");
  const [showQRModal, setShowQRModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);

  // ============================================
  // Check admin status — on mount + wallet change
  // ============================================
  useEffect(() => {
    async function checkAdmin() {
      const result = await checkIsAdmin(sector);
      setIsAdmin(result.isAdmin);
    }

    checkAdmin();

    // Listen for account changes
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (!accounts || accounts.length === 0) {
          setIsAdmin(false);
        } else {
          checkAdmin();
        }
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener(
            "accountsChanged",
            handleAccountsChanged
          );
        }
      };
    }
  }, [sector]);

  // ============================================
  // Auto-verify from URL
  // ============================================
  useEffect(() => {
    if (urlCertId) verify(urlCertId);
    // eslint-disable-next-line
  }, [urlCertId, sector]);

  async function verify(id, targetSector = sector) {
    if (!id) return;
    try {
      setLoading(true);
      setError("");
      setCert(null);
      setRevokeStatus("");

      const result = await verifyRecord(targetSector, id);

      if (!result.isValid) {
        setError("Record not found or has been revoked");
        return;
      }
      setCert({ id, ...result, sector: targetSector });
    } catch (e) {
      console.error(e);
      let msg = e.message;
      if (msg.includes("Contract not deployed")) {
        msg = "Contract not deployed yet";
      } else if (msg.includes("could not decode")) {
        msg = "Record not found on blockchain — it may be fake";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    if (searchId.trim()) navigate(`/verify/${searchId.trim()}?sector=${sector}`);
  }

  function changeSector(newSector) {
    setSector(newSector);
    setSearchParams({ sector: newSector });
    setCert(null);
    setError("");
    setSearchId("");
    setRevokeStatus("");
    navigate("/verify");
  }

  async function handleRevoke() {
    if (
      !window.confirm(
        `Are you sure you want to revoke ${cert.id}? This action is permanent and cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setRevoking(true);
      setRevokeStatus("");

      const txHash = await revokeRecord(sector, cert.id);
      setRevokeStatus(`✅ Record revoked! TX: ${txHash.slice(0, 20)}...`);

      // Re-verify to show revoked state
      setTimeout(() => verify(cert.id), 1500);
    } catch (e) {
      console.error(e);
      let msg = e.message;
      if (msg.includes("user rejected")) msg = "Transaction cancelled";
      if (msg.includes("Not admin")) msg = "Only admin can revoke";
      setRevokeStatus(`❌ ${msg}`);
    } finally {
      setRevoking(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-8">
      {/* Header */}
      <div className="text-center mb-10 animate-slide-up">
        <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200 mb-4">
          <span className="text-lg">🔍</span>
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            Blockchain Verification
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">
          Verify <span className="gradient-text">Record</span>
        </h1>
        <p className="text-lg text-slate-600">
          Enter ID or scan QR code to verify
        </p>
      </div>

      {/* Sector Selector */}
      <div
        className="mb-6 flex flex-wrap gap-2 animate-slide-up"
        style={{ animationDelay: "0.05s" }}
      >
        {Object.entries(SECTORS).map(([key, cfg]) => {
          const c = COLOR_MAP[cfg.color];
          const isActive = sector === key;
          return (
            <button
              key={key}
              onClick={() => changeSector(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                isActive
                  ? `bg-gradient-to-r ${c.gradient} text-white shadow-lg`
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>{cfg.icon}</span>
              {cfg.name}
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <form
        onSubmit={handleSearch}
        className={`card border-2 ${colors.border} mb-6 flex gap-3 flex-wrap animate-slide-up`}
        style={{ animationDelay: "0.1s" }}
      >
        <input
          type="text"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          placeholder={`Enter ${config.idLabel} (e.g., ${config.placeholder})`}
          className="input-field flex-1 min-w-[200px]"
          disabled={loading}
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="btn-primary whitespace-nowrap"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Verifying
              </>
            ) : (
              <>🔍 Verify</>
            )}
          </button>
          <button
            type="button"
            onClick={() => setShowScannerModal(true)}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition flex items-center gap-1.5 border border-slate-700 shadow-sm"
            title="Scan QR Code via Camera or File"
          >
            <span>📷</span> Scan QR
          </button>
        </div>
      </form>

      {/* Loading */}
      {loading && (
        <div className="text-center py-16 animate-fade-in">
          <div className="inline-block w-14 h-14 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-5 text-slate-600 font-medium">
            Verifying on blockchain...
          </p>
        </div>
      )}

      {/* NOT VERIFIED */}
      {error && !loading && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-10 text-center animate-scale-in">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-3xl font-extrabold text-rose-600 mb-3">
            NOT VERIFIED
          </h2>
          <p className="text-slate-700 mb-4 text-lg">{error}</p>
          <div className="bg-white rounded-xl p-4 inline-block">
            <p className="text-sm text-slate-500">
              This record does not exist on blockchain or has been revoked.
            </p>
          </div>
        </div>
      )}

      {/* VERIFIED */}
      {cert && !loading && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-8 animate-scale-in">
          <div className="text-center mb-6">
            <div className="text-7xl mb-3">✅</div>
            <h2 className="text-3xl font-extrabold text-emerald-600 mb-2">
              VERIFIED
            </h2>
            <p className="text-slate-600">Record is authentic</p>
          </div>

          <div className="bg-white rounded-xl p-6 space-y-3 shadow-sm">
            <div className="flex items-center justify-center mb-4">
              <span
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${colors.gradient} text-white text-sm font-semibold`}
              >
                {config.icon} {config.name}
              </span>
            </div>

            {cert.holderName && (
              <div className="flex justify-between border-b border-slate-100 pb-3 gap-4">
                <span className="font-medium text-slate-500">Holder Name:</span>
                <span className="text-slate-900 font-semibold text-right">
                  {cert.holderName}
                </span>
              </div>
            )}
            {cert.type && (
              <div className="flex justify-between border-b border-slate-100 pb-3 gap-4">
                <span className="font-medium text-slate-500">Type:</span>
                <span className="text-slate-900 font-semibold text-right">
                  {cert.type}
                </span>
              </div>
            )}
            {cert.doctorName && (
              <div className="flex justify-between border-b border-slate-100 pb-3 gap-4">
                <span className="font-medium text-slate-500">
                  Doctor / Hospital:
                </span>
                <span className="text-slate-900 font-semibold text-right">
                  {cert.doctorName}
                </span>
              </div>
            )}
            {cert.propertyAddress && (
              <div className="flex justify-between border-b border-slate-100 pb-3 gap-4">
                <span className="font-medium text-slate-500">Property:</span>
                <span className="text-slate-900 font-semibold text-right">
                  {cert.propertyAddress}
                </span>
              </div>
            )}
            <div className="flex justify-between border-b border-slate-100 pb-3 gap-4">
              <span className="font-medium text-slate-500">
                {config.idLabel}:
              </span>
              <span className="text-slate-900 font-semibold text-right">
                {cert.id}
              </span>
            </div>
            <div className="flex justify-between pb-3 gap-4">
              <span className="font-medium text-slate-500">Issue Date:</span>
              <span className="text-slate-900 font-semibold text-right">
                {cert.issueDate}
              </span>
            </div>

            <div className="pt-3 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href={getIPFSUrl(cert.ipfsHash)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary w-full text-center"
                >
                  📄 View IPFS Doc
                </a>
                <button
                  type="button"
                  onClick={() => setShowQRModal(true)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 border border-slate-700 shadow-sm transition"
                >
                  📱 Share / View QR
                </button>
              </div>

              {/* Admin-Only Revoke Button */}
              {isAdmin && (
                <button
                  onClick={handleRevoke}
                  disabled={revoking}
                  className="w-full bg-gradient-to-r from-rose-500 to-red-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {revoking ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                      Revoking...
                    </>
                  ) : (
                    <>🚫 Revoke This Record (Admin)</>
                  )}
                </button>
              )}

              {revokeStatus && (
                <div
                  className={`p-3 rounded-lg text-sm font-medium ${
                    revokeStatus.startsWith("✅")
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}
                >
                  {revokeStatus}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!cert && !error && !loading && (
        <div className="text-center py-16 card animate-fade-in">
          <div className="text-6xl mb-4 animate-float">{config.icon}</div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">
            Ready to verify
          </h3>
          <p className="text-slate-500">
            Enter a {config.idLabel.toLowerCase()} above to verify
          </p>
        </div>
      )}

      {/* QR Code Modal for Verified Record */}
      {cert && (
        <QRCodeModal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          id={cert.id || searchId}
          sector={sector}
          title={cert.holderName || `${config.name} Credential`}
        />
      )}

      {/* QR Code Camera / Image Scanner Modal */}
      <QRScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        onScanSuccess={({ id, sector: scannedSector }) => {
          const finalSector =
            scannedSector && SECTORS[scannedSector] ? scannedSector : sector;
          if (finalSector !== sector) {
            setSector(finalSector);
            setSearchParams({ sector: finalSector });
          }
          setSearchId(id);
          navigate(`/verify/${id}?sector=${finalSector}`);
        }}
      />
    </div>
  );
}