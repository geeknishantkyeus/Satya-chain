import React, { useState, useRef, useEffect } from "react";

export default function QRScannerModal({ isOpen, onClose, onScanSuccess }) {
  const [error, setError] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
    }
  }, [isOpen]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setScanning(false);
  };

  const handleStartCamera = async () => {
    setError("");
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera access not supported on this browser.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
      setScanning(true);

      // Start detection loop if BarcodeDetector is available
      if ("BarcodeDetector" in window) {
        const barcodeDetector = new window.BarcodeDetector({ formats: ["qr_code"] });
        const intervalId = setInterval(async () => {
          if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            try {
              const barcodes = await barcodeDetector.detect(videoRef.current);
              if (barcodes.length > 0) {
                clearInterval(intervalId);
                processDecodedText(barcodes[0].rawValue);
              }
            } catch (detectErr) {
              console.warn(detectErr);
            }
          }
        }, 500);
      }
    } catch (err) {
      setError(err.message || "Failed to start camera.");
      setCameraActive(false);
    }
  };

  const processDecodedText = (text) => {
    stopCamera();
    try {
      // Check if text is a URL with verify path
      if (text.includes("/verify/")) {
        const urlObj = new URL(text);
        const parts = urlObj.pathname.split("/verify/");
        const id = parts[1];
        const sector = urlObj.searchParams.get("sector") || "education";
        onScanSuccess({ id, sector });
        onClose();
        return;
      }

      // If it's a raw certificate ID
      onScanSuccess({ id: text.trim(), sector: "education" });
      onClose();
    } catch {
      onScanSuccess({ id: text.trim(), sector: "education" });
      onClose();
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    try {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await img.decode();

      if ("BarcodeDetector" in window) {
        const barcodeDetector = new window.BarcodeDetector({ formats: ["qr_code"] });
        const barcodes = await barcodeDetector.detect(img);
        if (barcodes.length > 0) {
          processDecodedText(barcodes[0].rawValue);
          return;
        }
      }

      // Fallback: draw to canvas and parse
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      // If barcode detector wasn't supported or didn't detect, suggest manual ID or browser support
      throw new Error(
        "Could not detect a clear QR Code in this image. Please ensure the QR is sharp, or enter the ID manually."
      );
    } catch (err) {
      setError(err.message || "Failed to parse QR image.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative text-center">
        {/* Close Button */}
        <button
          onClick={() => {
            stopCamera();
            onClose();
          }}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition"
        >
          ✕
        </button>

        {/* Header */}
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-xs font-semibold mb-3 border border-indigo-500/20">
          <span>📷</span> 2-Second QR Scanner
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Scan Certificate QR</h3>
        <p className="text-xs text-slate-400 mb-6">
          Scan with your camera or upload a certificate image / screenshot.
        </p>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 text-xs">
            {error}
          </div>
        )}

        {/* Video feed for camera scanning */}
        {cameraActive ? (
          <div className="relative mb-6 rounded-2xl overflow-hidden border-2 border-indigo-500/50 bg-black aspect-video flex items-center justify-center">
            <video ref={videoRef} className="w-full h-full object-cover" />
            <div className="absolute inset-0 border-2 border-dashed border-indigo-400/70 m-8 rounded-xl pointer-events-none animate-pulse"></div>
          </div>
        ) : (
          <div className="mb-6 border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-2xl p-8 transition bg-slate-950/50">
            <div className="text-4xl mb-3">📄</div>
            <label className="cursor-pointer">
              <span className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold inline-block transition shadow-lg shadow-indigo-600/30">
                Upload QR Image / PDF
              </span>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <p className="text-[11px] text-slate-500 mt-3">PNG, JPG, or screenshot</p>
          </div>
        )}

        {/* Camera Toggle Button */}
        <div className="flex gap-2 justify-center">
          {!cameraActive ? (
            <button
              onClick={handleStartCamera}
              className="py-2.5 px-5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
            >
              <span>📷</span> Open Camera Scanner
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="py-2.5 px-5 bg-red-600/20 text-red-300 hover:bg-red-600 hover:text-white rounded-xl text-xs font-semibold transition"
            >
              Stop Camera
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
