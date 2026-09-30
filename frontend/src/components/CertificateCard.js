import { useState } from "react";
import QRCodeModal from "./QRCodeModal";
import IPFSModal from "./IPFSModal";

export default function CertificateCard({ cert, onDownload, onViewIPFS }) {
  const [showQR, setShowQR] = useState(false);
  const [showIPFS, setShowIPFS] = useState(false);
  const hasNFT = cert.nftTokenId != null && cert.nftTokenId > 0;

  const handleIPFSClick = () => {
    if (onViewIPFS) {
      onViewIPFS(cert);
    } else {
      setShowIPFS(true);
    }
  };

  return (
    <div className="card hover:shadow-lg transition relative overflow-hidden bg-white/95 backdrop-blur-md border border-slate-200">
      {/* Soulbound ribbon (only if NFT minted) */}
      {hasNFT && (
        <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg tracking-wider">
          🎨 SOULBOUND NFT #{cert.nftTokenId}
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div className="pr-20">
          <h3 className="text-xl font-bold text-slate-900">
            {cert.studentName || cert.holderName || "Degree Holder"}
          </h3>
          <p className="text-slate-600 text-sm">{cert.course || "Degree Certificate"}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            cert.isValid
              ? "bg-emerald-100 text-emerald-700"
              : "bg-rose-100 text-rose-700"
          }`}
        >
          {cert.isValid ? "✓ VERIFIED" : "✗ REVOKED"}
        </span>
      </div>

      <div className="text-sm text-slate-600 space-y-1 mb-4">
        <p>
          <strong className="text-slate-700">ID:</strong> <span className="font-mono text-indigo-600">{cert.certId || cert.id}</span>
        </p>
        <p>
          <strong className="text-slate-700">Date:</strong> {cert.issueDate || "Recent"}
        </p>
        {cert.ipfsHash && (
          <p className="truncate">
            <strong className="text-slate-700">IPFS:</strong> <span className="font-mono text-xs text-slate-500">{cert.ipfsHash}</span>
          </p>
        )}
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
            className="flex-1 min-w-[90px] btn-primary text-xs py-2.5 font-bold flex items-center justify-center gap-1 shadow-sm"
            title="Download PDF Certificate"
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
          onClick={handleIPFSClick}
          className="flex-1 min-w-[90px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs py-2.5 font-bold transition flex items-center justify-center gap-1 border border-slate-200 shadow-sm"
          title="View IPFS Content & Gateways"
        >
          <span>🔗</span> IPFS
        </button>
      </div>

      <QRCodeModal
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        id={cert.certId || cert.id}
        sector="education"
        title={cert.studentName ? `${cert.studentName}'s Degree` : "Degree Certificate"}
      />

      <IPFSModal
        isOpen={showIPFS}
        onClose={() => setShowIPFS(false)}
        ipfsHash={cert.ipfsHash}
        id={cert.certId || cert.id}
        sector="education"
        title={cert.studentName ? `${cert.studentName}'s Certificate IPFS Proof` : "Certificate IPFS Proof"}
        onDownload={onDownload ? () => onDownload(cert) : null}
      />
    </div>
  );
}