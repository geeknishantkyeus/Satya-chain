import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import QRCode from "qrcode";

export default function QRCodeModal({ isOpen, onClose, id, sector = "education", title }) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const origin = window.location.origin;
  const pathname = window.location.pathname.replace(/\/$/, "");
  const verifyUrl = `${origin}${pathname}/#/verify/${id}?sector=${sector}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verifyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPNG = async () => {
    try {
      setDownloading(true);
      const pngUrl = await QRCode.toDataURL(verifyUrl, {
        width: 800,
        margin: 2,
        color: { dark: "#0f172a", light: "#ffffff" },
      });
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `SatyaChain-QR-${id}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (err) {
      console.error("QR PNG download error:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Header */}
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-xs font-semibold mb-3 border border-indigo-500/20">
          <span>🛡️</span> Verified On-Chain QR
        </div>
        <h3 className="text-xl font-bold text-white mb-1">
          {title || "Credential QR Code"}
        </h3>
        <p className="text-xs text-slate-400 mb-6 font-mono">
          ID: {id} • Sector: {sector.toUpperCase()}
        </p>

        {/* QR Code Container */}
        <div className="bg-white p-5 rounded-2xl shadow-inner inline-block mx-auto mb-6">
          <QRCodeSVG
            value={verifyUrl}
            size={220}
            level="H"
            includeMargin={true}
            imageSettings={{
              src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%234f46e5'><path d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'/></svg>",
              x: undefined,
              y: undefined,
              height: 36,
              width: 36,
              excavate: true,
            }}
          />
        </div>

        {/* Verification Link Preview */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 mb-5 text-[11px] text-slate-400 font-mono break-all text-left">
          <span className="text-slate-500 block mb-0.5 font-sans font-bold">Verification Target:</span>
          {verifyUrl}
        </div>

        {/* Scan instruction */}
        <p className="text-xs text-slate-400 mb-6">
          Scan with any smartphone camera for <strong>instant 2-second verification</strong>.
        </p>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <button
            onClick={handleDownloadPNG}
            disabled={downloading}
            className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-slate-700 disabled:opacity-50"
          >
            <span>{downloading ? "⏳" : "💾"}</span> {downloading ? "Saving..." : "Download PNG"}
          </button>
          <button
            onClick={handleCopyLink}
            className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-lg shadow-indigo-600/30"
          >
            <span>{copied ? "✓" : "📋"}</span> {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>

        {/* Direct Verify Hub Link */}
        <a
          href={verifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2.5 px-4 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 hover:border-transparent rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
        >
          <span>🔍</span> Open in Verification Hub →
        </a>
      </div>
    </div>
  );
}
