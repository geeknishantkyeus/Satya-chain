import React, { useState, useEffect } from "react";
import {
  issueGovernmentID,
  verifyGovernmentID,
  getReadOnlyContract,
  checkIsAdmin,
  revokeRecord,
} from "../utils/contractHelper";
import { uploadToIPFS, getIPFSUrl } from "../utils/ipfs";
import { generateSectorPDF, downloadPDF } from "../utils/pdfGenerator";
import { generateAgeProof } from "../utils/zkp";

export default function Government() {
  const [form, setForm] = useState({
    certId: "",
    idType: "Aadhaar",
    holderName: "",
    wallet: "",
  });

  const [searchId, setSearchId] = useState("");
  const [verifyResult, setVerifyResult] = useState(null);
  const [recentRecords, setRecentRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [isAdmin, setIsAdmin] = useState(false);
  const [zkpResult, setZkpResult] = useState(null);

  useEffect(() => {
    checkIsAdmin("government").then((res) => setIsAdmin(res.isAdmin));
    fetchRecentRecords();
  }, []);

  async function fetchRecentRecords() {
    try {
      const contract = await getReadOnlyContract("government");
      const ids = await contract.getAllIds();
      if (!ids || ids.length === 0) return;
      const latest = ids.slice(-5).reverse();
      const records = await Promise.all(
        latest.map(async (id) => {
          try {
            const data = await contract.verify(id);
            return {
              id,
              name: data[0],
              idType: data[1],
              ipfsHash: data[2],
              date: new Date(Number(data[3]) * 1000).toLocaleDateString(),
              valid: data[4],
            };
          } catch {
            return null;
          }
        })
      );
      setRecentRecords(records.filter(Boolean));
    } catch (err) {
      console.warn("Failed to fetch recent government records:", err);
    }
  }

  async function handleIssue(e) {
    e.preventDefault();
    if (!form.certId || !form.holderName || !form.idType || !form.wallet) {
      return setStatus({ type: "error", msg: "All fields are required" });
    }

    try {
      setLoading(true);
      setStatus({ type: "info", msg: "📄 Generating Government Credential PDF..." });

      const pdfBlob = await generateSectorPDF("government", {
        certId: form.certId,
        studentName: form.holderName,
        idType: form.idType,
      });
      downloadPDF(pdfBlob, `${form.certId}.pdf`);

      setStatus({ type: "info", msg: "☁️ Uploading to Decentralized IPFS..." });
      const pdfFile = new File([pdfBlob], `${form.certId}.pdf`, {
        type: "application/pdf",
      });
      const ipfsHash = await uploadToIPFS(pdfFile);

      setStatus({ type: "info", msg: "⛓️ Registering Credential On-Chain..." });
      await issueGovernmentID(
        form.certId,
        form.idType,
        form.holderName,
        ipfsHash,
        form.wallet
      );

      setStatus({
        type: "success",
        msg: `✅ Official ${form.idType} registered on-chain for ${form.holderName}!`,
      });
      setForm({ certId: "", idType: "Aadhaar", holderName: "", wallet: "" });
      fetchRecentRecords();
    } catch (err) {
      setStatus({ type: "error", msg: err.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(idToVerify) {
    const id = idToVerify || searchId;
    if (!id) return;
    try {
      setLoading(true);
      setZkpResult(null);
      const res = await verifyGovernmentID(id);
      setVerifyResult({ id, ...res });
    } catch (err) {
      setVerifyResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateZKP() {
    const proof = await generateAgeProof(2000, 2026, 18);
    setZkpResult(proof);
  }

  async function handleRevoke(id) {
    if (!window.confirm(`Revoke government credential ${id}?`)) return;
    try {
      setLoading(true);
      await revokeRecord("government", id);
      alert(`Credential ${id} has been revoked on-chain.`);
      fetchRecentRecords();
      if (verifyResult?.id === id) handleVerify(id);
    } catch (err) {
      alert("Revoke failed: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-10 animate-slide-up">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-cyan-50 border border-cyan-200/80 text-cyan-700 font-bold text-xs tracking-wider uppercase mb-3 shadow-soft-sm">
          <span>🆔</span> Sector 02: Government IDs
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-3">
          National Identity <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Registry</span>
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Cryptographically immutable Aadhaar, PAN, DL, and Passport registry. Eliminates identity fraud and enables Zero-Knowledge Selective Disclosure.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Issue Form */}
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-soft-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="text-2xl">🏛️</span> Issue National Identity
            </h2>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                isAdmin
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-cyan-50 text-cyan-700 border border-cyan-200"
              }`}
            >
              {isAdmin ? "✓ Registrar Active" : "ℹ️ Public Mode"}
            </span>
          </div>

          {status.msg && (
            <div
              className={`p-4 rounded-xl mb-6 text-sm font-medium ${
                status.type === "error"
                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                  : status.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-cyan-50 text-cyan-700 border border-cyan-200"
              }`}
            >
              {status.msg}
            </div>
          )}

          <form onSubmit={handleIssue} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Credential Type
              </label>
              <select
                value={form.idType}
                onChange={(e) => setForm({ ...form, idType: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 rounded-xl px-4 py-3 text-slate-900 font-medium text-sm transition-all"
              >
                <option value="Aadhaar">Aadhaar Card</option>
                <option value="PAN">PAN Card</option>
                <option value="Driving License">Driving License</option>
                <option value="Passport">Passport</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Document / ID Number
              </label>
              <input
                type="text"
                placeholder="e.g. AADH-9876-5432-1098"
                value={form.certId}
                onChange={(e) => setForm({ ...form, certId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 font-medium text-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Citizen Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Amit Kumar"
                value={form.holderName}
                onChange={(e) => setForm({ ...form, holderName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 font-medium text-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Citizen Wallet Address
              </label>
              <input
                type="text"
                placeholder="0x..."
                value={form.wallet}
                onChange={(e) => setForm({ ...form, wallet: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 font-mono text-sm transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-blue-500 shadow-glow-cyan hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 text-sm mt-4 cursor-pointer"
            >
              {loading ? "Registering on Blockchain..." : "🚀 Issue & Register On-Chain Credential"}
            </button>
          </form>
        </div>

        {/* Verification & ZKP */}
        <div className="space-y-8">
          {/* Search Box */}
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-soft-lg">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
              <span className="text-2xl">🔍</span> Verify Citizen Credential
            </h2>
            <div className="flex gap-2.5">
              <input
                type="text"
                placeholder="Enter Credential ID (e.g. AADH-1234-5678)..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 font-medium text-sm transition-all"
              />
              <button
                onClick={() => handleVerify()}
                disabled={loading}
                className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-cyan-500/25 cursor-pointer"
              >
                Verify
              </button>
            </div>

            {verifyResult && (
              <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-cyan-50/50 via-white to-blue-50/50 border border-cyan-200/80 shadow-soft-sm">
                {verifyResult.error ? (
                  <div className="text-rose-600 font-medium text-sm flex items-center gap-2">
                    <span>❌</span> {verifyResult.error}
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-cyan-100">
                      <span className="font-extrabold text-slate-900 text-lg">
                        {verifyResult.holderName}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          verifyResult.isValid
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : "bg-rose-100 text-rose-800 border border-rose-300"
                        }`}
                      >
                        {verifyResult.isValid ? "✓ Valid Identity" : "✕ Revoked"}
                      </span>
                    </div>
                    <div className="space-y-2 text-xs sm:text-sm text-slate-700">
                      <div><strong className="text-slate-900">ID Type:</strong> {verifyResult.type}</div>
                      <div><strong className="text-slate-900">Issue Date:</strong> {verifyResult.issueDate}</div>
                      {verifyResult.ipfsHash && (
                        <div>
                          <a
                            href={getIPFSUrl(verifyResult.ipfsHash)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-cyan-600 hover:text-cyan-800 font-semibold mt-1"
                          >
                            📄 View Secured IPFS Credential ↗
                          </a>
                        </div>
                      )}
                    </div>

                    {/* ZKP Zero-Knowledge Privacy Demo */}
                    <div className="mt-5 pt-4 border-t border-slate-200">
                      <button
                        onClick={handleGenerateZKP}
                        className="w-full py-2.5 px-4 bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white border border-purple-200 hover:border-transparent rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                      >
                        <span>🔒</span> Generate ZK-Proof (Age 18+ Without Revealing DOB)
                      </button>
                      {zkpResult && (
                        <div className="mt-3 p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 text-xs text-purple-900">
                          <div className="font-bold text-emerald-600 mb-1 flex items-center gap-1.5">
                            <span>✅</span> Zero-Knowledge Proof Valid!
                          </div>
                          <div>{zkpResult.claim}</div>
                          <div className="text-slate-500 text-[11px] mt-1 font-mono truncate">
                            Commitment: {zkpResult.proof.secretCommitment}
                          </div>
                        </div>
                      )}
                    </div>

                    {isAdmin && verifyResult.isValid && (
                      <button
                        onClick={() => handleRevoke(verifyResult.id)}
                        className="mt-4 w-full py-2.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 hover:border-transparent rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                      >
                        🚫 Revoke Identity Record
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recent Records */}
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-soft-lg">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span>📜</span> Recent Identity Registrations
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Live On-Chain
              </span>
            </h3>
            {recentRecords.length === 0 ? (
              <p className="text-xs text-slate-500 py-3">No records registered yet.</p>
            ) : (
              <div className="space-y-2.5">
                {recentRecords.map((r) => (
                  <div
                    key={r.id}
                    className="p-3.5 bg-slate-50/80 hover:bg-cyan-50/50 border border-slate-200/80 hover:border-cyan-200 rounded-2xl flex items-center justify-between transition-all"
                  >
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{r.name}</div>
                      <div className="text-xs text-slate-500">
                        {r.idType} • <span className="font-mono text-cyan-600 font-semibold">{r.id}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                          r.valid
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {r.valid ? "✓ Valid" : "Revoked"}
                      </span>
                      <button
                        onClick={() => handleVerify(r.id)}
                        className="text-xs font-bold text-cyan-600 hover:text-cyan-800 px-2 py-1 hover:bg-cyan-100/50 rounded-lg transition"
                      >
                        Verify →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
