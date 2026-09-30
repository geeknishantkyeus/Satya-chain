import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  issueCertificate,
  issueGovernmentID,
  issueHealthcareRecord,
  issueLandRecord,
  mintCertificateNFT,
  mintLandDeedNFT,
  mintHealthRecordNFT,
  getNFTTokenIdByCertId,
  getLandDeedTokenIdByDeedId,
  getHealthTokenIdByRecordId,
} from "../utils/contractHelper";
import { uploadToIPFS, uploadJSONToIPFS } from "../utils/ipfs";
import { generateSectorPDF, downloadPDF } from "../utils/pdfGenerator";

// ============================================
// SECTOR CONFIG
// ============================================
const SECTOR_CONFIG = {
  education: {
    name: "Education",
    icon: "🎓",
    color: "indigo",
    fields: [
      { key: "certId", label: "Certificate ID", placeholder: "2024-001", required: true },
      { key: "studentName", label: "Student Name", placeholder: "Rahul Sharma", required: true },
      { key: "course", label: "Course", placeholder: "B.Tech Computer Science", required: true },
      { key: "wallet", label: "Student Wallet", placeholder: "0x...", required: true, isWallet: true },
    ],
  },
  government: {
    name: "Government IDs",
    icon: "🆔",
    color: "cyan",
    fields: [
      { key: "certId", label: "ID Number", placeholder: "AADH-1234-5678", required: true },
      { key: "idType", label: "ID Type", placeholder: "Aadhaar / PAN / DL / Passport", required: true },
      { key: "studentName", label: "Holder Name", placeholder: "Amit Kumar", required: true },
      { key: "wallet", label: "Holder Wallet", placeholder: "0x...", required: true, isWallet: true },
    ],
  },
  healthcare: {
    name: "Healthcare",
    icon: "🏥",
    color: "emerald",
    fields: [
      { key: "certId", label: "Record ID", placeholder: "HLT-2024-001", required: true },
      { key: "idType", label: "Record Type", placeholder: "Prescription / Report / Insurance", required: true },
      { key: "studentName", label: "Patient Name", placeholder: "Priya Patel", required: true },
      { key: "doctorName", label: "Doctor / Hospital", placeholder: "Dr. Sharma", required: false },
      { key: "wallet", label: "Patient Wallet", placeholder: "0x...", required: true, isWallet: true },
    ],
  },
  land: {
    name: "Land & Property",
    icon: "🏠",
    color: "amber",
    fields: [
      { key: "certId", label: "Deed ID", placeholder: "LAND-2024-001", required: true },
      { key: "idType", label: "Deed Type", placeholder: "Property Title / Sale Deed", required: true },
      { key: "studentName", label: "Owner Name", placeholder: "Rajesh Singh", required: true },
      { key: "propertyAddress", label: "Property Address", placeholder: "Mumbai, Maharashtra", required: false },
      { key: "wallet", label: "Owner Wallet", placeholder: "0x...", required: true, isWallet: true },
    ],
  },
};

const COLOR_MAP = {
  indigo: { gradient: "from-indigo-500 to-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200" },
  cyan: { gradient: "from-cyan-500 to-cyan-600", bg: "bg-cyan-50", border: "border-cyan-200" },
  emerald: { gradient: "from-emerald-500 to-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  amber: { gradient: "from-amber-500 to-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
};

export default function University() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSector = searchParams.get("sector") || "education";
  const [sector, setSector] = useState(initialSector);
  const config = SECTOR_CONFIG[sector];
  const colors = COLOR_MAP[config.color];

  const [form, setForm] = useState({
    certId: "",
    studentName: "",
    idType: "",
    course: "",
    doctorName: "",
    propertyAddress: "",
    wallet: "",
    university: "Mumbai University",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [lastCert, setLastCert] = useState(null);

  function updateField(key, value) {
    setForm({ ...form, [key]: value });
  }

  function changeSector(newSector) {
    setSector(newSector);
    setSearchParams({ sector: newSector });
    setStatus({ type: "", msg: "" });
    setLastCert(null);
    setForm({
      certId: "",
      studentName: "",
      idType: "",
      course: "",
      doctorName: "",
      propertyAddress: "",
      wallet: "",
      university: "Mumbai University",
    });
  }

  function validate() {
    for (const field of config.fields) {
      if (field.required && !form[field.key]?.trim()) {
        return `${field.label} required`;
      }
    }
    if (form.wallet && !/^0x[0-9a-fA-F]{40}$/.test(form.wallet.trim())) {
      return "Valid wallet address required (0x...)";
    }
    return null;
  }

  async function handleIssue() {
    const err = validate();
    if (err) return setStatus({ type: "error", msg: err });

    try {
      setLoading(true);

      setStatus({ type: "info", msg: "📄 Generating PDF..." });

      const pdfData = {
        certId: form.certId,
        studentName: form.studentName,
        course: form.course || form.idType || form.university,
        idType: form.idType,
        doctorName: form.doctorName,
        propertyAddress: form.propertyAddress,
        university: form.university,
      };

      const pdfBlob = await generateSectorPDF(sector, pdfData);
      downloadPDF(pdfBlob, `${form.certId}.pdf`);

      setStatus({ type: "info", msg: "☁️ Uploading PDF to IPFS..." });
      const pdfFile = new File([pdfBlob], `${form.certId}.pdf`, {
        type: "application/pdf",
      });
      const ipfsHash = await uploadToIPFS(pdfFile);

      setStatus({ type: "info", msg: "⛓️ Storing on blockchain..." });

      let txHash;
      if (sector === "education") {
        txHash = await issueCertificate(
          form.certId,
          form.studentName,
          form.course || "General",
          ipfsHash,
          form.wallet
        );
      } else if (sector === "government") {
        txHash = await issueGovernmentID(
          form.certId,
          form.idType,
          form.studentName,
          ipfsHash,
          form.wallet
        );
      } else if (sector === "healthcare") {
        txHash = await issueHealthcareRecord(
          form.certId,
          form.idType,
          form.studentName,
          form.doctorName,
          ipfsHash,
          form.wallet
        );
      } else if (sector === "land") {
        txHash = await issueLandRecord(
          form.certId,
          form.idType,
          form.studentName,
          form.propertyAddress,
          ipfsHash,
          form.wallet
        );
      }

      // ============================================
      // ⭐ NFT MINTING
      // ============================================
      let nftTokenId = null;
      let nftTxHash = null;
      let nftMetadataURI = null;
      let nftKind = null;

      // ---- Education: Soulbound Certificate ----
      if (sector === "education") {
        try {
          setStatus({ type: "info", msg: "🎨 Minting Soulbound Certificate NFT..." });

          const nftMetadata = {
            name: `${form.course} Certificate - ${form.studentName}`,
            description: `Blockchain-verified certificate from ${form.university}. Soulbound — non-transferable.`,
            image: `ipfs://${ipfsHash}`,
            attributes: [
              { trait_type: "Type", value: "Soulbound Certificate" },
              { trait_type: "Student Name", value: form.studentName },
              { trait_type: "Course", value: form.course },
              { trait_type: "University", value: form.university },
              { trait_type: "Issue Date", value: new Date().toISOString().split("T")[0] },
              { trait_type: "Certificate ID", value: form.certId },
              { trait_type: "PDF", value: `ipfs://${ipfsHash}` },
            ],
          };

          nftMetadataURI = await uploadJSONToIPFS(nftMetadata, `${form.certId}-metadata.json`);
          nftTxHash = await mintCertificateNFT(form.wallet, form.certId, nftMetadataURI);
          try {
            nftTokenId = await getNFTTokenIdByCertId(form.certId);
          } catch {
            nftTokenId = "?";
          }
          nftKind = "soulbound";
        } catch (nftError) {
          console.error("NFT minting failed:", nftError);
          setStatus({
            type: "info",
            msg: `✅ Certificate issued, but NFT minting failed: ${nftError.message}`,
          });
        }
      }

      // ---- Land: Transferable Deed NFT ----
      if (sector === "land") {
        try {
          setStatus({ type: "info", msg: "🏠 Minting Land Deed NFT..." });

          const nftMetadata = {
            name: `Land Deed ${form.certId} - ${form.studentName}`,
            description: `Blockchain-verified land deed. Transferable. Deed ID: ${form.certId}`,
            image: `ipfs://${ipfsHash}`,
            attributes: [
              { trait_type: "Type", value: "Transferable Land Deed" },
              { trait_type: "Owner Name", value: form.studentName },
              { trait_type: "Deed Type", value: form.idType },
              { trait_type: "Property Address", value: form.propertyAddress },
              { trait_type: "Issue Date", value: new Date().toISOString().split("T")[0] },
              { trait_type: "Deed ID", value: form.certId },
              { trait_type: "PDF", value: `ipfs://${ipfsHash}` },
            ],
          };

          nftMetadataURI = await uploadJSONToIPFS(nftMetadata, `${form.certId}-land-metadata.json`);
          nftTxHash = await mintLandDeedNFT(form.wallet, form.certId, nftMetadataURI);
          try {
            nftTokenId = await getLandDeedTokenIdByDeedId(form.certId);
          } catch {
            nftTokenId = "?";
          }
          nftKind = "land";
        } catch (nftError) {
          console.error("Land NFT minting failed:", nftError);
          setStatus({
            type: "info",
            msg: `✅ Land record issued, but deed NFT minting failed: ${nftError.message}`,
          });
        }
      }

      // ---- Healthcare: Soulbound + Access Control ----
      if (sector === "healthcare") {
        try {
          setStatus({ type: "info", msg: "🏥 Minting Health Record NFT..." });

          const nftMetadata = {
            name: `${form.idType} - ${form.studentName}`,
            description: `Blockchain-verified medical record. Soulbound. Access is patient-controlled.`,
            image: `ipfs://${ipfsHash}`,
            attributes: [
              { trait_type: "Type", value: "Soulbound Health Record" },
              { trait_type: "Patient Name", value: form.studentName },
              { trait_type: "Record Type", value: form.idType },
              { trait_type: "Doctor / Hospital", value: form.doctorName || "N/A" },
              { trait_type: "Issue Date", value: new Date().toISOString().split("T")[0] },
              { trait_type: "Record ID", value: form.certId },
              { trait_type: "PDF", value: `ipfs://${ipfsHash}` },
            ],
          };

          nftMetadataURI = await uploadJSONToIPFS(nftMetadata, `${form.certId}-health-metadata.json`);
          nftTxHash = await mintHealthRecordNFT(form.wallet, form.certId, nftMetadataURI);
          try {
            nftTokenId = await getHealthTokenIdByRecordId(form.certId);
          } catch {
            nftTokenId = "?";
          }
          nftKind = "health";
        } catch (nftError) {
          console.error("Health NFT minting failed:", nftError);
          setStatus({
            type: "info",
            msg: `✅ Health record issued, but NFT minting failed: ${nftError.message}`,
          });
        }
      }

      setLastCert({
        ...form,
        ipfsHash,
        txHash,
        sector,
        nftTokenId,
        nftTxHash,
        nftMetadataURI,
        nftKind,
      });

      let successMsg = `✅ ${config.name} record issued successfully!`;
      if (nftTokenId && nftKind === "soulbound") {
        successMsg = `✅ Certificate issued + Soulbound NFT #${nftTokenId} minted!`;
      } else if (nftTokenId && nftKind === "land") {
        successMsg = `✅ Land record issued + Transferable Deed NFT #${nftTokenId} minted!`;
      } else if (nftTokenId && nftKind === "health") {
        successMsg = `✅ Health record issued + Soulbound NFT #${nftTokenId} minted (patient controls access)!`;
      }
      setStatus({ type: "success", msg: successMsg });

      setForm({
        certId: "",
        studentName: "",
        idType: "",
        course: "",
        doctorName: "",
        propertyAddress: "",
        wallet: "",
        university: "Mumbai University",
      });
    } catch (e) {
      console.error(e);
      let msg = e.message;
      if (msg.includes("user rejected")) msg = "Transaction cancelled";
      if (msg.includes("Not admin")) msg = "Only admin wallet can issue";
      if (msg.includes("exists")) msg = "ID already exists";
      if (msg.includes("Pinata") || msg.includes("IPFS"))
        msg = "PDF downloaded ✓ — but IPFS upload failed";
      if (msg.includes("Contract not deployed"))
        msg = "PDF downloaded ✓ — but contract not deployed";
      setStatus({ type: "error", msg: `⚠️ ${msg}` });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8">
      {/* Header */}
      <div className="mb-8 animate-slide-up">
        <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200 mb-4">
          <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            Issue Records
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">
          Issue New{" "}
          <span className="gradient-text">{config.name} Record</span>
        </h1>
        <p className="text-lg text-slate-600">
          Fill the details — record will be stored on blockchain + IPFS
          {sector === "education" && " + Soulbound NFT"}
          {sector === "land" && " + Transferable Deed NFT"}
          {sector === "healthcare" && " + Soulbound Health NFT (patient controls access)"}
        </p>
      </div>

      {/* Sector Selector */}
      <div className="mb-6 flex flex-wrap gap-2 animate-slide-up" style={{ animationDelay: "0.1s" }}>
        {Object.entries(SECTOR_CONFIG).map(([key, cfg]) => {
          const c = COLOR_MAP[cfg.color];
          const isActive = sector === key;
          return (
            <button
              key={key}
              onClick={() => changeSector(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                isActive
                  ? `bg-gradient-to-r ${c.gradient} text-white shadow-lg`
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>{cfg.icon}</span>
              {cfg.name}
            </button>
          );
        })}
      </div>

      {/* Form Card */}
      <div className={`card border-2 ${colors.border} space-y-5 animate-slide-up`} style={{ animationDelay: "0.2s" }}>
        {config.fields.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {field.label}
              {field.required && <span className="text-rose-500"> *</span>}
            </label>
            <input
              type="text"
              value={form[field.key] || ""}
              onChange={(e) => updateField(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="input-field"
              disabled={loading}
            />
            {field.isWallet && (
              <p className="text-xs text-slate-500 mt-1">
                Enter the holder's wallet address (the person who will receive this record)
              </p>
            )}
          </div>
        ))}

        <button
          onClick={handleIssue}
          disabled={loading}
          className="btn-primary w-full py-4 text-base"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Processing...
            </>
          ) : (
            <>🎉 Issue {config.name} Record</>
          )}
        </button>

        {status.msg && (
          <div
            className={`p-4 rounded-xl text-sm font-medium ${
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
      </div>

      {/* Last Record */}
      {lastCert && (
        <div className="card mt-6 border-emerald-200 bg-emerald-50/50 animate-scale-in">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🎉</span>
            <h3 className="font-bold text-emerald-900 text-lg">
              Last Issued Record
            </h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="bg-white rounded-lg p-3 border border-emerald-100">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">ID</div>
              <div className="font-semibold text-slate-900">{lastCert.certId}</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-emerald-100">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Holder</div>
              <div className="font-semibold text-slate-900">{lastCert.studentName}</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-emerald-100 md:col-span-2">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">IPFS Hash</div>
              <div className="font-mono text-xs text-indigo-600 break-all">{lastCert.ipfsHash}</div>
            </div>
            {lastCert.txHash && (
              <div className="bg-white rounded-lg p-3 border border-emerald-100 md:col-span-2">
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Transaction</div>
                <div className="font-mono text-xs text-indigo-600 break-all">{lastCert.txHash}</div>
              </div>
            )}

            {lastCert.nftTokenId && (
              <>
                <div
                  className={`rounded-lg p-3 border md:col-span-2 ${
                    lastCert.nftKind === "land"
                      ? "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200"
                      : lastCert.nftKind === "health"
                      ? "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200"
                      : "bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">
                      {lastCert.nftKind === "land"
                        ? "🏠"
                        : lastCert.nftKind === "health"
                        ? "🏥"
                        : "🎨"}
                    </span>
                    <div
                      className={`text-xs uppercase tracking-wider font-bold ${
                        lastCert.nftKind === "land"
                          ? "text-amber-700"
                          : lastCert.nftKind === "health"
                          ? "text-emerald-700"
                          : "text-purple-700"
                      }`}
                    >
                      {lastCert.nftKind === "land"
                        ? "Transferable Deed NFT Minted"
                        : lastCert.nftKind === "health"
                        ? "Soulbound Health NFT Minted"
                        : "Soulbound NFT Minted"}
                    </div>
                  </div>
                  <div
                    className={`font-semibold text-base ${
                      lastCert.nftKind === "land"
                        ? "text-amber-900"
                        : lastCert.nftKind === "health"
                        ? "text-emerald-900"
                        : "text-purple-900"
                    }`}
                  >
                    Token ID #{lastCert.nftTokenId}
                  </div>
                  {lastCert.nftKind === "health" && (
                    <p className="text-xs text-emerald-800 mt-1">
                      🔐 Patient controls access — grant/revoke from Student page.
                    </p>
                  )}
                </div>
                {lastCert.nftMetadataURI && (
                  <div className="bg-white rounded-lg p-3 border border-slate-100 md:col-span-2">
                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">NFT Metadata URI</div>
                    <div className="font-mono text-xs text-slate-600 break-all">{lastCert.nftMetadataURI}</div>
                  </div>
                )}
                {lastCert.nftTxHash && (
                  <div className="bg-white rounded-lg p-3 border border-slate-100 md:col-span-2">
                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">NFT Transaction</div>
                    <div className="font-mono text-xs text-slate-600 break-all">{lastCert.nftTxHash}</div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}