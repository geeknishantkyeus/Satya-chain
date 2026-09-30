import { useState } from "react";
import QRCodeModal from "./QRCodeModal";
import IPFSModal from "./IPFSModal";

export default function GovernmentCredentialCard({ credential, onDownload, onViewIPFS }) {
  const [showQR, setShowQR] = useState(false);
  const [showIPFS, setShowIPFS] = useState(false);

  const handleIPFSClick = () => {
    if (onViewIPFS) {
      onViewIPFS(credential);
    } else {
      setShowIPFS(true);
    }
  };

  return (
    <div className="card hover:shadow-lg transition relative overflow-hidden bg-white/95 backdrop-blur-md border border-slate-200">
      {/* Ribbon */}
      <div className="absolute top-0 right-0 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg tracking-wider">
        🆔 CREDENTIAL
      </div>

      <div className="pr-24 mb-4">
        <h3 className="text-xl font-bold text-slate-900">
          {credential.holderName}
        </h3>
        <p className="text-cyan-700 font-semibold text-sm">{credential.idType}</p>
      </div>

      <div className="text-sm text-slate-600 space-y-1 mb-4">
        <p>
          <strong className="text-slate-700">ID:</strong> <span className="font-mono text-cyan-700 font-bold">{credential.id}</span>
        </p>
        <p>
          <strong className="text-slate-700">Date:</strong> {credential.issueDate || "Recent"}
        </p>
        {credential.ipfsHash && (
          <p className="truncate">
            <strong className="text-slate-700">IPFS:</strong> <span className="font-mono text-xs text-slate-500">{credential.ipfsHash}</span>
          </p>
        )}
      </div>

      <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-2.5 mb-4 text-xs text-cyan-800 leading-relaxed">
        ⚡ <strong>Verifiable Credential:</strong> Cryptographically signed by official government authority and anchored on-chain.
      </div>

      <div className="flex gap-2 flex-wrap">
        {onDownload && (
          <button
            onClick={() => onDownload(credential)}
            className="flex-1 min-w-[90px] btn-primary text-xs py-2.5 font-bold flex items-center justify-center gap-1 shadow-sm"
            title="Download Official ID Document"
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
        id={credential.id}
        sector="government"
        title={`${credential.holderName}'s ${credential.idType}`}
      />

      <IPFSModal
        isOpen={showIPFS}
        onClose={() => setShowIPFS(false)}
        ipfsHash={credential.ipfsHash}
        id={credential.id}
        sector="government"
        title={`${credential.holderName}'s Identity IPFS Proof`}
        onDownload={onDownload ? () => onDownload(credential) : null}
      />
    </div>
  );
}