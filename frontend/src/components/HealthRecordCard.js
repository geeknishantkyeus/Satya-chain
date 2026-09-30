import { useState, useEffect } from "react";
import {
  grantHealthAccess,
  revokeHealthAccess,
  checkHealthAccess,
} from "../utils/contractHelper";
import QRCodeModal from "./QRCodeModal";
import IPFSModal from "./IPFSModal";

export default function HealthRecordCard({ record, onDownload, onViewIPFS }) {
  const [showQR, setShowQR] = useState(false);
  const [showIPFS, setShowIPFS] = useState(false);
  const [doctorAddress, setDoctorAddress] = useState("");
  const [granting, setGranting] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [accessStatus, setAccessStatus] = useState(null);
  const [feedback, setFeedback] = useState({ type: "", msg: "" });

  const isValidAddress = /^0x[0-9a-fA-F]{40}$/.test(doctorAddress.trim());

  // Check if the entered doctor currently has access
  async function checkAccess() {
    if (!isValidAddress) {
      setAccessStatus(null);
      return;
    }
    try {
      const has = await checkHealthAccess(record.tokenId, doctorAddress.trim());
      setAccessStatus(has);
    } catch {
      setAccessStatus(null);
    }
  }

  useEffect(() => {
    checkAccess();
    // eslint-disable-next-line
  }, [doctorAddress]);

  async function handleGrant() {
    if (!isValidAddress) return;
    try {
      setGranting(true);
      setFeedback({ type: "", msg: "" });
      await grantHealthAccess(record.tokenId, doctorAddress.trim());
      setFeedback({ type: "success", msg: `✅ Access granted to ${doctorAddress.slice(0, 10)}…` });
      setAccessStatus(true);
    } catch (e) {
      setFeedback({ type: "error", msg: `⚠️ ${e.message}` });
    } finally {
      setGranting(false);
    }
  }

  async function handleRevoke() {
    if (!isValidAddress) return;
    try {
      setRevoking(true);
      setFeedback({ type: "", msg: "" });
      await revokeHealthAccess(record.tokenId, doctorAddress.trim());
      setFeedback({ type: "success", msg: `✅ Access revoked from ${doctorAddress.slice(0, 10)}…` });
      setAccessStatus(false);
    } catch (e) {
      setFeedback({ type: "error", msg: `⚠️ ${e.message}` });
    } finally {
      setRevoking(false);
    }
  }

  return (
    <div className="card hover:shadow-lg transition relative overflow-hidden">
      {/* Ribbon */}
      <div className="absolute top-0 right-0 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg tracking-wider">
        🏥 HEALTH #{record.tokenId}
      </div>

      <div className="pr-20 mb-4">
        <h3 className="text-xl font-bold text-emerald-900">
          Medical Record #{record.tokenId}
        </h3>
        <p className="text-gray-600 text-sm">Soulbound · Access-controlled</p>
      </div>

      <div className="text-sm text-gray-600 space-y-1 mb-4">
        <p>
          <strong>Token ID:</strong> #{record.tokenId}
        </p>
        <p className="text-emerald-700">
          <strong>Status:</strong> Locked 🔒 · Patient owns
        </p>
      </div>

      {/* Access Control */}
      <div className="border-t border-slate-200 pt-4 mb-4">
        <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wider">
          🔐 Doctor Access
        </label>
        <input
          type="text"
          value={doctorAddress}
          onChange={(e) => setDoctorAddress(e.target.value)}
          placeholder="0x doctor wallet..."
          className="input-field text-xs"
          disabled={granting || revoking}
        />

        {isValidAddress && accessStatus !== null && (
          <p
            className={`text-xs mt-1 font-medium ${
              accessStatus ? "text-emerald-600" : "text-slate-500"
            }`}
          >
            {accessStatus ? "✓ This doctor has access" : "✗ No access currently"}
          </p>
        )}

        <div className="flex gap-2 mt-3">
          <button
            onClick={handleGrant}
            disabled={!isValidAddress || granting || revoking}
            className="flex-1 btn-primary text-xs py-2 disabled:opacity-50"
          >
            {granting ? "Granting..." : "✅ Grant"}
          </button>
          <button
            onClick={handleRevoke}
            disabled={!isValidAddress || granting || revoking}
            className="flex-1 btn-secondary text-xs py-2 disabled:opacity-50"
          >
            {revoking ? "Revoking..." : "🚫 Revoke"}
          </button>
        </div>

        {feedback.msg && (
          <div
            className={`mt-3 p-2 rounded-lg text-xs font-medium ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-rose-50 text-rose-700 border border-rose-200"
            }`}
          >
            {feedback.msg}
          </div>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {onDownload && (
          <button
            onClick={() => onDownload(record)}
            className="flex-1 min-w-[90px] btn-primary text-xs py-2.5 font-bold flex items-center justify-center gap-1 shadow-sm"
            title="Download Medical Record PDF"
          >
            <span>📄</span> Download
          </button>
        )}
        <button
          onClick={() => setShowQR(true)}
          className="flex-1 min-w-[90px] bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs py-2.5 font-bold transition flex items-center justify-center gap-1 border border-slate-700 shadow-sm"
          title="Show Verification QR Code"
        >
          <span>📱</span> QR Code
        </button>
        <button
          onClick={() => (onViewIPFS ? onViewIPFS(record) : setShowIPFS(true))}
          className="flex-1 min-w-[90px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs py-2.5 font-bold transition flex items-center justify-center gap-1 border border-slate-200 shadow-sm"
          title="View IPFS Content & Gateways"
        >
          <span>🔗</span> IPFS
        </button>
      </div>

      <QRCodeModal
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        id={record.tokenId}
        sector="healthcare"
        title={`Health Record #${record.tokenId}`}
      />

      <IPFSModal
        isOpen={showIPFS}
        onClose={() => setShowIPFS(false)}
        ipfsHash={record.uri}
        id={record.tokenId}
        sector="healthcare"
        title={`Health Record #${record.tokenId} IPFS Proof`}
        onDownload={onDownload ? () => onDownload(record) : null}
      />
    </div>
  );
}