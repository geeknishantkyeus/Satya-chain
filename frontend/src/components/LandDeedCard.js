import { useState } from "react";
import QRCodeModal from "./QRCodeModal";
import IPFSModal from "./IPFSModal";

export default function LandDeedCard({ deed, onDownload, onViewIPFS }) {
  const [showQR, setShowQR] = useState(false);
  const [showIPFS, setShowIPFS] = useState(false);

  const cleanUri = (deed.uri || "").replace("ipfs://", "");

  const handleIPFSClick = () => {
    if (onViewIPFS) {
      onViewIPFS(deed);
    } else {
      setShowIPFS(true);
    }
  };

  return (
    <div className="card hover:shadow-lg transition relative overflow-hidden bg-white/95 backdrop-blur-md border border-slate-200">
      {/* Ribbon */}
      <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg tracking-wider">
        🏠 LAND DEED #{deed.tokenId}
      </div>

      <div className="pr-20 mb-4">
        <h3 className="text-xl font-bold text-slate-900">
          Land Deed #{deed.tokenId}
        </h3>
        <p className="text-amber-700 font-semibold text-sm">Transferable Property NFT</p>
      </div>

      <div className="text-sm text-slate-600 space-y-1 mb-4">
        <p>
          <strong className="text-slate-700">Token ID:</strong> <span className="font-mono text-amber-700 font-bold">#{deed.tokenId}</span>
        </p>
        <p>
          <strong className="text-slate-700">Transfers:</strong> {deed.transfers ?? 0}
        </p>
        <p className="text-amber-800 font-medium">
          <strong>Status:</strong> Transferable On-Chain ✅
        </p>
        {cleanUri && (
          <p className="truncate">
            <strong className="text-slate-700">URI:</strong> <span className="font-mono text-xs text-slate-500">{cleanUri}</span>
          </p>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {onDownload && (
          <button
            onClick={() => onDownload(deed)}
            className="flex-1 min-w-[90px] btn-primary text-xs py-2.5 font-bold flex items-center justify-center gap-1 shadow-sm"
            title="Download Official Land Title Deed PDF"
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
        id={deed.tokenId}
        sector="land"
        title={`Land Deed #${deed.tokenId}`}
      />

      <IPFSModal
        isOpen={showIPFS}
        onClose={() => setShowIPFS(false)}
        ipfsHash={deed.uri}
        id={deed.tokenId}
        sector="land"
        title={`Land Deed #${deed.tokenId} IPFS Proof`}
        onDownload={onDownload ? () => onDownload(deed) : null}
      />
    </div>
  );
}