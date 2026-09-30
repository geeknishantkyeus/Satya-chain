import React, { useState, useEffect } from "react";
import {
  issueCertificate,
  verifyCertificate,
  mintCertificateNFT,
  getReadOnlyContract,
  checkIsAdmin,
  revokeRecord,
} from "../utils/contractHelper";
import { uploadToIPFS, uploadJSONToIPFS, getIPFSUrl } from "../utils/ipfs";
import { generateSectorPDF, downloadPDF } from "../utils/pdfGenerator";

export default function Education() {
  const [form, setForm] = useState({
    certId: "",
    studentName: "",
    course: "",
    wallet: "",
    university: "Satya-Chain Verified University",
  });

  const [searchId, setSearchId] = useState("");
  const [verifyResult, setVerifyResult] = useState(null);
  const [recentRecords, setRecentRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkIsAdmin("education").then((res) => setIsAdmin(res.isAdmin));
    fetchRecentRecords();
  }, []);

  async function fetchRecentRecords() {
    try {
      const contract = await getReadOnlyContract("education");
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
              course: data[1],
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
      console.warn("Failed to fetch recent education records:", err);
    }
  }

  async function handleIssue(e) {
    e.preventDefault();
    if (!form.certId || !form.studentName || !form.course || !form.wallet) {
      return setStatus({ type: "error", msg: "All fields are required" });
    }

    try {
      setLoading(true);
      setStatus({ type: "info", msg: "📄 Generating Verified PDF..." });

      const pdfBlob = await generateSectorPDF("education", {
        certId: form.certId,
        studentName: form.studentName,
        course: form.course,
        university: form.university,
      });
      downloadPDF(pdfBlob, `${form.certId}.pdf`);

      setStatus({ type: "info", msg: "☁️ Uploading PDF to IPFS..." });
      const pdfFile = new File([pdfBlob], `${form.certId}.pdf`, {
        type: "application/pdf",
      });
      const ipfsHash = await uploadToIPFS(pdfFile);

      setStatus({ type: "info", msg: "⛓️ Issuing Certificate On-Chain..." });
      await issueCertificate(
        form.certId,
        form.studentName,
        form.course,
        ipfsHash,
        form.wallet
      );

      setStatus({ type: "info", msg: "🎨 Minting Soulbound NFT (ERC-5192)..." });
      const nftMetadata = {
        name: `${form.course} Certificate - ${form.studentName}`,
        description: `Verified soulbound degree issued on Satya-Chain. Non-transferable.`,
        image: `ipfs://${ipfsHash}`,
        attributes: [
          { trait_type: "Sector", value: "Education" },
          { trait_type: "Student", value: form.studentName },
          { trait_type: "Course", value: form.course },
          { trait_type: "Certificate ID", value: form.certId },
        ],
      };
      const metadataUri = await uploadJSONToIPFS(nftMetadata);
      await mintCertificateNFT(form.wallet, form.certId, metadataUri);

      setStatus({
        type: "success",
        msg: `✅ Certificate & Soulbound NFT issued for ${form.studentName}!`,
      });
      setForm({ certId: "", studentName: "", course: "", wallet: "", university: "Satya-Chain Verified University" });
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
      const res = await verifyCertificate(id);
      setVerifyResult({ id, ...res });
    } catch (err) {
      setVerifyResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleRevoke(id) {
    if (!window.confirm(`Are you sure you want to revoke Certificate ${id}?`)) return;
    try {
      setLoading(true);
      await revokeRecord("education", id);
      alert(`Certificate ${id} revoked and Soulbound NFT burned.`);
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
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 font-bold text-xs tracking-wider uppercase mb-3 shadow-soft-sm">
          <span>🎓</span> Sector 01: Education
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-3">
          Soulbound Certificate <span className="gradient-text">Registry</span>
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Permanent degree records secured with ERC-5192 Soulbound NFTs. Non-transferable, tamper-proof, and verifiable in 2 seconds.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Issue Form */}
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-soft-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="text-2xl">🏛️</span> Issue Degree / Certificate
            </h2>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                isAdmin
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}
            >
              {isAdmin ? "✓ Admin Connected" : "ℹ️ Read-Only Mode"}
            </span>
          </div>

          {status.msg && (
            <div
              className={`p-4 rounded-xl mb-6 text-sm font-medium ${
                status.type === "error"
                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                  : status.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-indigo-50 text-indigo-700 border border-indigo-200"
              }`}
            >
              {status.msg}
            </div>
          )}

          <form onSubmit={handleIssue} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Certificate ID
              </label>
              <input
                type="text"
                placeholder="e.g. IITB-2026-CS-001"
                value={form.certId}
                onChange={(e) => setForm({ ...form, certId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 font-medium text-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Student Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={form.studentName}
                onChange={(e) => setForm({ ...form, studentName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 font-medium text-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Degree / Course
              </label>
              <input
                type="text"
                placeholder="e.g. B.Tech Computer Science"
                value={form.course}
                onChange={(e) => setForm({ ...form, course: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 font-medium text-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Student Wallet Address
              </label>
              <input
                type="text"
                placeholder="0x..."
                value={form.wallet}
                onChange={(e) => setForm({ ...form, wallet: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 font-mono text-sm transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-glow-indigo hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 text-sm mt-4 cursor-pointer"
            >
              {loading ? "Processing Blockchain Transaction..." : "🚀 Issue & Auto-Mint Soulbound NFT"}
            </button>
          </form>
        </div>

        {/* Verification & Search */}
        <div className="space-y-8">
          {/* Search Box */}
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-soft-lg">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
              <span className="text-2xl">🔍</span> 2-Second Degree Verification
            </h2>
            <div className="flex gap-2.5">
              <input
                type="text"
                placeholder="Enter Certificate ID (e.g. 2024-001)..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 font-medium text-sm transition-all"
              />
              <button
                onClick={() => handleVerify()}
                disabled={loading}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-indigo-500/25 cursor-pointer"
              >
                Verify
              </button>
            </div>

            {verifyResult && (
              <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50 border border-indigo-200/80 shadow-soft-sm">
                {verifyResult.error ? (
                  <div className="text-rose-600 font-medium text-sm flex items-center gap-2">
                    <span>❌</span> {verifyResult.error}
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-indigo-100">
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
                        {verifyResult.isValid ? "✓ Authentic" : "✕ Revoked"}
                      </span>
                    </div>
                    <div className="space-y-2 text-xs sm:text-sm text-slate-700">
                      <div><strong className="text-slate-900">Course:</strong> {verifyResult.type}</div>
                      <div><strong className="text-slate-900">Issued On:</strong> {verifyResult.issueDate}</div>
                      {verifyResult.ipfsHash && (
                        <div>
                          <a
                            href={getIPFSUrl(verifyResult.ipfsHash)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-semibold mt-1"
                          >
                            📄 View Original IPFS Document ↗
                          </a>
                        </div>
                      )}
                    </div>
                    {isAdmin && verifyResult.isValid && (
                      <button
                        onClick={() => handleRevoke(verifyResult.id)}
                        className="mt-4 w-full py-2.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 hover:border-transparent rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                      >
                        🚫 Revoke Certificate & Burn NFT
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
                <span>📜</span> Recent Education Records
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Live On-Chain
              </span>
            </h3>
            {recentRecords.length === 0 ? (
              <p className="text-xs text-slate-500 py-3">No records issued yet.</p>
            ) : (
              <div className="space-y-2.5">
                {recentRecords.map((r) => (
                  <div
                    key={r.id}
                    className="p-3.5 bg-slate-50/80 hover:bg-indigo-50/50 border border-slate-200/80 hover:border-indigo-200 rounded-2xl flex items-center justify-between transition-all"
                  >
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{r.name}</div>
                      <div className="text-xs text-slate-500">
                        {r.course} • <span className="font-mono text-indigo-600 font-semibold">{r.id}</span>
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
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 px-2 py-1 hover:bg-indigo-100/50 rounded-lg transition"
                      >
                        Check →
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
