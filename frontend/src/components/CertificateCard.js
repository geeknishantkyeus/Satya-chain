import { useState } from "react";
import QRCodeModal from "./QRCodeModal";

export default function CertificateCard({ cert, onDownload, onViewIPFS }) {
  const [showQR, setShowQR] = useState(false);
  const hasNFT = cert.nftTokenId != null && cert.nftTokenId > 0;

  return (
    <div className="card hover:shadow-lg transition relative overflow-hidden">
      {/* Soulbound ribbon (only if NFT minted) */}
      {hasNFT && (
        <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg tracking-wider">
          🎨 SOULBOUND NFT #{cert.nftTokenId}
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div className="pr-20">
          <h3 className="text-xl font-bold text-blue-900">
            {cert.studentName}
          </h3>
          <p className="text-gray-600">{cert.course}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            cert.isValid
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {cert.isValid ? "✓ VERIFIED" : "✗ REVOKED"}
        </span>
      </div>

      <div className="text-sm text-gray-600 space-y-1 mb-4">
        <p>
          <strong>ID:</strong> {cert.certId}
        </p>
        <p>
          <strong>Date:</strong> {cert.issueDate}
        </p>
        {hasNFT && (
          <p className="text-purple-700">
            <strong>NFT Token:</strong> #{cert.nftTokenId} · locked 🔒
          </p>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {onDownload && (
          <button
            onClick={() => onDownload(cert)}
            className="flex-1 min-w-[90px] btn-primary text-sm py-2"
          >
            📄 Download
          </button>
        )}
        <button
          onClick={() => setShowQR(true)}
          className="flex-1 min-w-[90px] bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm py-2 font-medium transition flex items-center justify-center gap-1 border border-slate-700 shadow-sm"
          title="Show Verification QR Code"
        >
          📱 QR Code
        </button>
        {onViewIPFS && (
          <button
            onClick={() => onViewIPFS(cert)}
            className="flex-1 min-w-[90px] btn-secondary text-sm py-2"
          >
            🔗 IPFS
          </button>
        )}
      </div>

      <QRCodeModal
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        id={cert.certId}
        sector="education"
        title={cert.studentName ? `${cert.studentName}'s Degree` : "Degree Certificate"}
      />
    </div>
  );
}