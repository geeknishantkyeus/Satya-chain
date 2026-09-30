import React, { useState } from "react";
import { getIPFSUrl } from "../utils/ipfs";

export default function IPFSModal({ isOpen, onClose, ipfsHash, title, id, sector = "education", onDownload }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const cleanHash = (ipfsHash || "").replace("ipfs://", "").replace(/^\/+/, "");
  const ipfsIoUrl = `https://ipfs.io/ipfs/${cleanHash}`;
  const dwebUrl = `https://dweb.link/ipfs/${cleanHash}`;
  const cloudflareUrl = `https://cloudflare-ipfs.com/ipfs/${cleanHash}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanHash || ipfsHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Header */}
        <div className="inline-flex items-center gap-2 bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full text-xs font-semibold mb-3 border border-cyan-500/20">
          <span>📦</span> IPFS Decentralized Storage
        </div>
        <h3 className="text-xl font-bold text-white mb-1">
          {title || "Immutable Record Proof"}
        </h3>
        <p className="text-xs text-slate-400 mb-6 font-mono">
          ID: {id || "N/A"} • Sector: {sector.toUpperCase()}
        </p>

        {/* CID Box */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 mb-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Content Identifier (CID / Multihash)
            </span>
            <button
              onClick={handleCopy}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition"
            >
              <span>{copied ? "✓" : "📋"}</span> {copied ? "Copied!" : "Copy CID"}
            </button>
          </div>
          <div className="font-mono text-xs text-emerald-400 break-all select-all bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
            {cleanHash || "Not available"}
          </div>
        </div>

        {/* Info Explainer */}
        <div className="bg-indigo-950/40 border border-indigo-500/20 rounded-xl p-3 mb-6 text-xs text-indigo-200/90 leading-relaxed">
          🔒 <strong>Cryptographic Immutability:</strong> This hash is the exact SHA-256 content digest stored on the blockchain smart contract. Any modification to the document will produce a completely different hash.
        </div>

        {/* Public Gateway Options */}
        <div className="space-y-2 mb-6">
          <span className="text-xs font-semibold text-slate-300 block mb-2">
            Open with Public IPFS Gateways:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <a
              href={ipfsIoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 bg-slate-800 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition text-center border border-slate-700 hover:border-transparent"
            >
              <span>🌐</span> ipfs.io
            </a>
            <a
              href={dwebUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 bg-slate-800 hover:bg-cyan-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition text-center border border-slate-700 hover:border-transparent"
            >
              <span>🌐</span> dweb.link
            </a>
            <a
              href={cloudflareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 bg-slate-800 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition text-center border border-slate-700 hover:border-transparent"
            >
              <span>🌐</span> Cloudflare
            </a>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex gap-3">
          {onDownload && (
            <button
              onClick={() => {
                onClose();
                onDownload();
              }}
              className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
            >
              <span>📄</span> Download Document PDF
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition border border-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
