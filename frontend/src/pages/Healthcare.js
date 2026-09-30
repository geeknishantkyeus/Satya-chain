import React, { useState, useEffect } from "react";
import {
  issueHealthcareRecord,
  verifyHealthcareRecord,
  mintHealthRecordNFT,
  getHealthTokenIdByRecordId,
  grantHealthAccess,
  revokeHealthAccess,
  checkHealthAccess,
  getReadOnlyContract,
  checkIsAdmin,
} from "../utils/contractHelper";
import { uploadToIPFS, uploadJSONToIPFS, getIPFSUrl } from "../utils/ipfs";
import { generateSectorPDF, downloadPDF } from "../utils/pdfGenerator";

export default function Healthcare() {
  const [form, setForm] = useState({
    certId: "",
    recordType: "Medical Report",
    patientName: "",
    doctorName: "Dr. A. Sharma (MD, AIIMS)",
    wallet: "",
  });

  const [searchId, setSearchId] = useState("");
  const [verifyResult, setVerifyResult] = useState(null);
  const [recentRecords, setRecentRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [isAdmin, setIsAdmin] = useState(false);

  // ACL state
  const [aclTokenId, setAclTokenId] = useState("");
  const [doctorWallet, setDoctorWallet] = useState("");
  const [hasDoctorAccess, setHasDoctorAccess] = useState(null);

  useEffect(() => {
    checkIsAdmin("healthcare").then((res) => setIsAdmin(res.isAdmin));
    fetchRecentRecords();
  }, []);

  async function fetchRecentRecords() {
    try {
      const contract = await getReadOnlyContract("healthcare");
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
              recordType: data[1],
              doctorName: data[2],
              ipfsHash: data[3],
              date: new Date(Number(data[4]) * 1000).toLocaleDateString(),
              valid: data[5],
            };
          } catch {
            return null;
          }
        })
      );
      setRecentRecords(records.filter(Boolean));
    } catch (err) {
      console.warn("Failed to fetch recent healthcare records:", err);
    }
  }

  async function handleIssue(e) {
    e.preventDefault();
    if (!form.certId || !form.patientName || !form.recordType || !form.wallet) {
      return setStatus({ type: "error", msg: "All fields are required" });
    }

    try {
      setLoading(true);
      setStatus({ type: "info", msg: "📄 Generating Encrypted Medical Report PDF..." });

      const pdfBlob = await generateSectorPDF("healthcare", {
        certId: form.certId,
        studentName: form.patientName,
        idType: form.recordType,
        doctorName: form.doctorName,
      });
      downloadPDF(pdfBlob, `${form.certId}.pdf`);

      setStatus({ type: "info", msg: "☁️ Uploading Medical Data to IPFS..." });
      const pdfFile = new File([pdfBlob], `${form.certId}.pdf`, {
        type: "application/pdf",
      });
      const ipfsHash = await uploadToIPFS(pdfFile);

      setStatus({ type: "info", msg: "⛓️ Registering Record on Blockchain..." });
      await issueHealthcareRecord(
        form.certId,
        form.recordType,
        form.patientName,
        form.doctorName,
        ipfsHash,
        form.wallet
      );

      setStatus({ type: "info", msg: "🏥 Minting Patient-Controlled Soulbound NFT..." });
      const nftMetadata = {
        name: `Health Record ${form.certId} - ${form.patientName}`,
        description: `Confidential patient medical record. Access controlled by patient via Soulbound NFT.`,
        image: `ipfs://${ipfsHash}`,
        attributes: [
          { trait_type: "Sector", value: "Healthcare" },
          { trait_type: "Record Type", value: form.recordType },
          { trait_type: "Patient", value: form.patientName },
          { trait_type: "Doctor", value: form.doctorName },
          { trait_type: "Record ID", value: form.certId },
        ],
      };
      const metadataUri = await uploadJSONToIPFS(nftMetadata);
      await mintHealthRecordNFT(form.wallet, form.certId, metadataUri);

      setStatus({
        type: "success",
        msg: `✅ Medical Record & Soulbound NFT registered for ${form.patientName}!`,
      });
      setForm({ certId: "", recordType: "Medical Report", patientName: "", doctorName: "Dr. A. Sharma", wallet: "" });
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
      const res = await verifyHealthcareRecord(id);
      let tokenId = null;
      try {
        tokenId = await getHealthTokenIdByRecordId(id);
      } catch (e) {
        console.warn(e);
      }
      setVerifyResult({ id, ...res, tokenId });
    } catch (err) {
      setVerifyResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleGrantAccess() {
    if (!aclTokenId || !doctorWallet) return alert("Token ID and Doctor Wallet required");
    try {
      setLoading(true);
      await grantHealthAccess(Number(aclTokenId), doctorWallet);
      alert(`✅ Access granted to doctor (${doctorWallet}) for Record #${aclTokenId}`);
      handleCheckAccess();
    } catch (err) {
      alert("Grant failed: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRevokeAccess() {
    if (!aclTokenId || !doctorWallet) return alert("Token ID and Doctor Wallet required");
    try {
      setLoading(true);
      await revokeHealthAccess(Number(aclTokenId), doctorWallet);
      alert(`🚫 Doctor access revoked for Record #${aclTokenId}`);
      handleCheckAccess();
    } catch (err) {
      alert("Revoke failed: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckAccess() {
    if (!aclTokenId || !doctorWallet) return;
    const hasAccess = await checkHealthAccess(Number(aclTokenId), doctorWallet);
    setHasDoctorAccess(hasAccess);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold text-xs tracking-wider uppercase mb-3 border border-emerald-500/20">
          Sector 04: Healthcare
        </span>
        <h1 className="text-4xl font-extrabold text-white tracking-tight">
          Patient-Controlled Health Records 🏥
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto mt-2 text-sm">
          Patients own their health records as Soulbound NFTs. Only authorized doctors can be granted temporary cryptographic read access.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Issue Form */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🏥</span> Issue Medical Record
            </h2>
            <span className={`text-xs px-2.5 py-1 rounded-md ${isAdmin ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"}`}>
              {isAdmin ? "Hospital Admin Active" : "Public Mode"}
            </span>
          </div>

          {status.msg && (
            <div className={`p-4 rounded-xl mb-6 text-sm ${status.type === "error" ? "bg-red-500/20 text-red-300 border border-red-500/30" : status.type === "success" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"}`}>
              {status.msg}
            </div>
          )}

          <form onSubmit={handleIssue} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">Record Type</label>
              <select
                value={form.recordType}
                onChange={(e) => setForm({ ...form, recordType: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-sm"
              >
                <option value="Medical Report">Medical Report</option>
                <option value="Prescription">Prescription</option>
                <option value="Lab Test Results">Lab Test Results</option>
                <option value="Discharge Summary">Discharge Summary</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">Health Record ID</label>
              <input
                type="text"
                placeholder="e.g. HLT-2026-MED-990"
                value={form.certId}
                onChange={(e) => setForm({ ...form, certId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">Patient Full Name</label>
              <input
                type="text"
                placeholder="e.g. Priya Patel"
                value={form.patientName}
                onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">Attending Doctor / Hospital</label>
              <input
                type="text"
                placeholder="e.g. Dr. A. Sharma (AIIMS)"
                value={form.doctorName}
                onChange={(e) => setForm({ ...form, doctorName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">Patient Wallet Address</label>
              <input
                type="text"
                placeholder="0x..."
                value={form.wallet}
                onChange={(e) => setForm({ ...form, wallet: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/30 transition-all duration-200 disabled:opacity-50 text-sm mt-4"
            >
              {loading ? "Registering on Blockchain..." : "Issue & Mint Soulbound Medical NFT"}
            </button>
          </form>
        </div>

        {/* Verification & Patient Access Control List (ACL) */}
        <div className="space-y-8">
          {/* Search Box */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
              <span>🔍</span> Verify Medical Record
            </h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Record ID..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
              />
              <button
                onClick={() => handleVerify()}
                disabled={loading}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition-all duration-200"
              >
                Verify
              </button>
            </div>

            {verifyResult && (
              <div className="mt-6 p-4 rounded-xl bg-slate-950 border border-slate-800">
                {verifyResult.error ? (
                  <div className="text-red-400 text-sm">{verifyResult.error}</div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
                      <span className="font-bold text-white text-base">{verifyResult.holderName}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${verifyResult.isValid ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"}`}>
                        {verifyResult.isValid ? "✓ Authentic Medical Record" : "✕ Revoked"}
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-300">
                      <div><span className="text-slate-500">Record Type:</span> {verifyResult.type}</div>
                      <div><span className="text-slate-500">Doctor / Hospital:</span> {verifyResult.doctorName}</div>
                      <div><span className="text-slate-500">Date:</span> {verifyResult.issueDate}</div>
                      {verifyResult.tokenId && (
                        <div className="text-emerald-400 text-xs mt-1">Soulbound NFT Token #{verifyResult.tokenId}</div>
                      )}
                      {verifyResult.ipfsHash && (
                        <div className="mt-2">
                          <a href={getIPFSUrl(verifyResult.ipfsHash)} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">
                            📄 View Secured Medical Document ↗
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Patient Access Control Widget */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <span>🔐</span> Patient Access Control (ACL)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Patient gives temporary permission to a doctor or hospital to access this medical record.
            </p>
            <div className="space-y-3">
              <input
                type="number"
                placeholder="Medical NFT Token ID (e.g. 1)"
                value={aclTokenId}
                onChange={(e) => setAclTokenId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <input
                type="text"
                placeholder="Doctor's Wallet Address (0x...)"
                value={doctorWallet}
                onChange={(e) => setDoctorWallet(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
              />
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={handleGrantAccess}
                  disabled={loading}
                  className="py-2 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 rounded-xl text-xs font-semibold transition"
                >
                  Grant Access
                </button>
                <button
                  type="button"
                  onClick={handleRevokeAccess}
                  disabled={loading}
                  className="py-2 bg-red-600/30 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 rounded-xl text-xs font-semibold transition"
                >
                  Revoke Access
                </button>
                <button
                  type="button"
                  onClick={handleCheckAccess}
                  className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
                >
                  Check Access
                </button>
              </div>

              {hasDoctorAccess !== null && (
                <div className={`p-2.5 rounded-lg text-xs font-semibold text-center border ${hasDoctorAccess ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-red-500/10 text-red-400 border-red-500/30"}`}>
                  {hasDoctorAccess ? "✅ Doctor currently has authorized access" : "🔒 Doctor does NOT have access"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
