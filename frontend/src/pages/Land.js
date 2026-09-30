import React, { useState, useEffect } from "react";
import {
  issueLandRecord,
  verifyLandRecord,
  mintLandDeedNFT,
  getLandDeedTokenIdByDeedId,
  getLandDeedMetadata,
  transferLandDeed,
  getReadOnlyContract,
  checkIsAdmin,
  revokeRecord,
} from "../utils/contractHelper";
import { uploadToIPFS, uploadJSONToIPFS, getIPFSUrl } from "../utils/ipfs";
import { generateSectorPDF, downloadPDF } from "../utils/pdfGenerator";

export default function Land() {
  const [form, setForm] = useState({
    certId: "",
    deedType: "Sale Deed",
    ownerName: "",
    propertyAddress: "",
    wallet: "",
  });

  const [searchId, setSearchId] = useState("");
  const [verifyResult, setVerifyResult] = useState(null);
  const [recentRecords, setRecentRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [isAdmin, setIsAdmin] = useState(false);

  // Transfer deed state
  const [transferTokenId, setTransferTokenId] = useState("");
  const [transferToAddress, setTransferToAddress] = useState("");

  useEffect(() => {
    checkIsAdmin("land").then((res) => setIsAdmin(res.isAdmin));
    fetchRecentRecords();
  }, []);

  async function fetchRecentRecords() {
    try {
      const contract = await getReadOnlyContract("land");
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
              deedType: data[1],
              propertyAddress: data[2],
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
      console.warn("Failed to fetch recent land records:", err);
    }
  }

  async function handleIssue(e) {
    e.preventDefault();
    if (!form.certId || !form.ownerName || !form.propertyAddress || !form.wallet) {
      return setStatus({ type: "error", msg: "All fields are required" });
    }

    try {
      setLoading(true);
      setStatus({ type: "info", msg: "📄 Generating Official Title Deed PDF..." });

      const pdfBlob = await generateSectorPDF("land", {
        certId: form.certId,
        studentName: form.ownerName,
        idType: form.deedType,
        propertyAddress: form.propertyAddress,
      });
      downloadPDF(pdfBlob, `${form.certId}.pdf`);

      setStatus({ type: "info", msg: "☁️ Uploading Deed to IPFS..." });
      const pdfFile = new File([pdfBlob], `${form.certId}.pdf`, {
        type: "application/pdf",
      });
      const ipfsHash = await uploadToIPFS(pdfFile);

      setStatus({ type: "info", msg: "⛓️ Recording Deed on Blockchain..." });
      await issueLandRecord(
        form.certId,
        form.deedType,
        form.ownerName,
        form.propertyAddress,
        ipfsHash,
        form.wallet
      );

      setStatus({ type: "info", msg: "🏠 Minting Transferable Land Deed NFT..." });
      const nftMetadata = {
        name: `Land Deed ${form.certId} - ${form.ownerName}`,
        description: `Official property title deed registered on Satya-Chain. Transferable upon sale.`,
        image: `ipfs://${ipfsHash}`,
        attributes: [
          { trait_type: "Sector", value: "Land & Property" },
          { trait_type: "Deed Type", value: form.deedType },
          { trait_type: "Owner", value: form.ownerName },
          { trait_type: "Property Address", value: form.propertyAddress },
          { trait_type: "Deed ID", value: form.certId },
        ],
      };
      const metadataUri = await uploadJSONToIPFS(nftMetadata);
      await mintLandDeedNFT(form.wallet, form.certId, metadataUri);

      setStatus({
        type: "success",
        msg: `✅ Land Deed & NFT registered for ${form.ownerName}!`,
      });
      setForm({ certId: "", deedType: "Sale Deed", ownerName: "", propertyAddress: "", wallet: "" });
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
      const res = await verifyLandRecord(id);
      let nftInfo = null;
      try {
        const tokenId = await getLandDeedTokenIdByDeedId(id);
        if (tokenId > 0) {
          nftInfo = await getLandDeedMetadata(tokenId);
        }
      } catch (e) {
        console.warn("NFT details fetch skipped:", e);
      }
      setVerifyResult({ id, ...res, nftInfo });
    } catch (err) {
      setVerifyResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleTransferDeed(e) {
    e.preventDefault();
    if (!transferTokenId || !transferToAddress) {
      return alert("Token ID and Recipient Address required");
    }
    try {
      setLoading(true);
      await transferLandDeed(transferToAddress, Number(transferTokenId));
      alert(`🎉 Land Deed NFT #${transferTokenId} transferred to ${transferToAddress}! Transfer count updated.`);
      setTransferTokenId("");
      setTransferToAddress("");
    } catch (err) {
      alert("Transfer failed: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <span className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-400 font-semibold text-xs tracking-wider uppercase mb-3 border border-amber-500/20">
          Sector 03: Land & Property
        </span>
        <h1 className="text-4xl font-extrabold text-white tracking-tight">
          Property Registry & Transferable Deeds 🏠
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto mt-2 text-sm">
          Eliminates fake registry and land mafia scams. Real estate title deeds as transferable NFTs with permanent transfer count audit trails.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Issue Form */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🏛️</span> Register Land Deed
            </h2>
            <span className={`text-xs px-2.5 py-1 rounded-md ${isAdmin ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"}`}>
              {isAdmin ? "Sub-Registrar Active" : "Public Mode"}
            </span>
          </div>

          {status.msg && (
            <div className={`p-4 rounded-xl mb-6 text-sm ${status.type === "error" ? "bg-red-500/20 text-red-300 border border-red-500/30" : status.type === "success" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"}`}>
              {status.msg}
            </div>
          )}

          <form onSubmit={handleIssue} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">Deed Type</label>
              <select
                value={form.deedType}
                onChange={(e) => setForm({ ...form, deedType: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 text-sm"
              >
                <option value="Sale Deed">Sale Deed</option>
                <option value="Gift Deed">Gift Deed</option>
                <option value="Relinquishment Deed">Relinquishment Deed</option>
                <option value="Partition Deed">Partition Deed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">Deed Number / Survey ID</label>
              <input
                type="text"
                placeholder="e.g. MH-MUM-2026-LAND-042"
                value={form.certId}
                onChange={(e) => setForm({ ...form, certId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">Owner Full Name</label>
              <input
                type="text"
                placeholder="e.g. Rajesh Singh"
                value={form.ownerName}
                onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">Property Address & Details</label>
              <input
                type="text"
                placeholder="Plot 42, Bandra West, Mumbai 400050"
                value={form.propertyAddress}
                onChange={(e) => setForm({ ...form, propertyAddress: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">Owner Wallet Address</label>
              <input
                type="text"
                placeholder="0x..."
                value={form.wallet}
                onChange={(e) => setForm({ ...form, wallet: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-lg shadow-amber-600/30 transition-all duration-200 disabled:opacity-50 text-sm mt-4"
            >
              {loading ? "Registering on Blockchain..." : "Issue & Mint Transferable Land Deed NFT"}
            </button>
          </form>
        </div>

        {/* Verification & Transfer */}
        <div className="space-y-8">
          {/* Search Box */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
              <span>🔍</span> Verify Property Title Deed
            </h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Deed ID..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm"
              />
              <button
                onClick={() => handleVerify()}
                disabled={loading}
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl text-sm transition-all duration-200"
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
                        {verifyResult.isValid ? "✓ Authentic Deed" : "✕ Disputed / Revoked"}
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-300">
                      <div><span className="text-slate-500">Deed Type:</span> {verifyResult.type}</div>
                      <div><span className="text-slate-500">Address:</span> {verifyResult.propertyAddress}</div>
                      <div><span className="text-slate-500">Issued On:</span> {verifyResult.issueDate}</div>
                      {verifyResult.nftInfo && (
                        <div className="mt-2 p-2 rounded bg-slate-900 border border-amber-500/30">
                          <div className="text-amber-400 font-semibold">NFT Deed Token #{verifyResult.nftInfo.tokenId}</div>
                          <div>Current Owner: <span className="font-mono text-[10px]">{verifyResult.nftInfo.owner}</span></div>
                          <div className="text-emerald-400 font-bold">Transfer Count: {verifyResult.nftInfo.transfers} times</div>
                        </div>
                      )}
                      {verifyResult.ipfsHash && (
                        <div className="mt-2">
                          <a href={getIPFSUrl(verifyResult.ipfsHash)} target="_blank" rel="noreferrer" className="text-amber-400 hover:underline">
                            📄 View Original Registered Title Deed ↗
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Transfer Deed Widget */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <span>🤝</span> Transfer Property Title (Sale of Land)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              When land is legally sold, transfer the NFT deed to the buyer. This increments the on-chain transfer count permanently.
            </p>
            <form onSubmit={handleTransferDeed} className="space-y-3">
              <input
                type="number"
                placeholder="NFT Token ID (e.g. 1)"
                value={transferTokenId}
                onChange={(e) => setTransferTokenId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <input
                type="text"
                placeholder="Buyer's Wallet Address (0x...)"
                value={transferToAddress}
                onChange={(e) => setTransferToAddress(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-amber-600/30 hover:bg-amber-600 text-amber-200 hover:text-white border border-amber-500/40 rounded-xl text-xs font-semibold transition"
              >
                Execute Ownership Transfer
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
