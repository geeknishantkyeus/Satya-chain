import { useState } from "react";
import QRCodeModal from "./QRCodeModal";

export default function LandDeedCard({ deed }) {
  const [showQR, setShowQR] = useState(false);

  return (
    <div className="card hover:shadow-lg transition relative overflow-hidden">
      {/* Ribbon */}
      <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg tracking-wider">
        🏠 LAND DEED #{deed.tokenId}
      </div>

      <div className="pr-20 mb-4">
        <h3 className="text-xl font-bold text-amber-900">
          Land Deed #{deed.tokenId}
        </h3>
        <p className="text-gray-600 text-sm">Transferable NFT</p>
      </div>

      <div className="text-sm text-gray-600 space-y-1 mb-4">
        <p>
          <strong>Token ID:</strong> #{deed.tokenId}
        </p>
        <p>
          <strong>Transfers:</strong> {deed.transfers}
        </p>
        <p className="text-amber-700">
          <strong>Status:</strong> Transferable ✅
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setShowQR(true)}
          className="flex-1 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm py-2 font-medium transition flex items-center justify-center gap-1 border border-slate-700 shadow-sm"
          title="Show Verification QR Code"
        >
          📱 QR Code
        </button>
        <a
          href={`https://gateway.pinata.cloud/ipfs/${deed.uri.replace("ipfs://", "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 btn-secondary text-sm py-2 text-center"
        >
          🔗 View Metadata
        </a>
      </div>

      <QRCodeModal
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        id={deed.tokenId}
        sector="land"
        title={`Land Deed #${deed.tokenId}`}
      />
    </div>
  );
}