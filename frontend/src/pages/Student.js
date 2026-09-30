import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { connectWallet, getCurrentAccount } from "../utils/wallet";
import {
  getCertificatesByStudent,
  getNFTTokenIdByCertId,
  getLandDeedsByOwner,
  getHealthRecordsByOwner,
  getGovernmentRecordsByWallet,
} from "../utils/contractHelper";
import { getIPFSUrl } from "../utils/ipfs";
import CertificateCard from "../components/CertificateCard";
import LandDeedCard from "../components/LandDeedCard";
import HealthRecordCard from "../components/HealthRecordCard";
import GovernmentCredentialCard from "../components/GovernmentCredentialCard";

export default function Student() {
  const [account, setAccount] = useState("");
  const [certs, setCerts] = useState([]);
  const [landDeeds, setLandDeeds] = useState([]);
  const [healthRecords, setHealthRecords] = useState([]);
  const [govRecords, setGovRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const manuallyDisconnected = localStorage.getItem("wallet_disconnected");
    if (!manuallyDisconnected) {
      getCurrentAccount().then((addr) => {
        if (addr) {
          setAccount(addr);
          fetchAll(addr);
        }
      });
    }
    // eslint-disable-next-line
  }, []);

  async function handleConnect() {
    try {
      localStorage.removeItem("wallet_disconnected");
      const { address } = await connectWallet();
      setAccount(address);
      fetchAll(address);
    } catch (e) {
      alert(e.message);
    }
  }

  async function fetchAll(address) {
    try {
      setLoading(true);
      setError("");

      // --- Education certificates ---
      const certData = await getCertificatesByStudent(address);
      const enriched = await Promise.all(
        certData.map(async (cert) => {
          try {
            const tokenId = await getNFTTokenIdByCertId(cert.certId);
            return { ...cert, nftTokenId: tokenId > 0 ? tokenId : null };
          } catch {
            return { ...cert, nftTokenId: null };
          }
        })
      );
      setCerts(enriched);

      // --- Land deeds ---
      const deeds = await getLandDeedsByOwner(address);
      setLandDeeds(deeds);

      // --- Health records ---
      const records = await getHealthRecordsByOwner(address);
      setHealthRecords(records);

      // --- Government credentials ---
      const gov = await getGovernmentRecordsByWallet(address);
      setGovRecords(gov);
    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleDownload(cert) {
    window.open(getIPFSUrl(cert.ipfsHash), "_blank");
  }

  function handleViewIPFS(cert) {
    window.open(getIPFSUrl(cert.ipfsHash), "_blank");
  }

  // Not connected
  if (!account) {
    return (
      <div className="max-w-2xl mx-auto p-6 md:p-8 text-center">
        <div className="card animate-scale-in">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-4xl shadow-lg shadow-indigo-500/30">
            🔗
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-3">
            Connect Your Wallet
          </h1>
          <p className="text-slate-600 mb-8 max-w-md mx-auto">
            Connect MetaMask to view your certificates, credentials, deeds,
            and health records
          </p>
          <button onClick={handleConnect} className="btn-primary px-8 py-4">
            🔌 Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  const nftCount = certs.filter((c) => c.nftTokenId).length;
  const totalAssets =
    certs.length + landDeeds.length + healthRecords.length + govRecords.length;

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start flex-wrap gap-4 animate-slide-up">
        <div>
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200 mb-4">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              My Assets
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">
            My <span className="gradient-text">Digital Assets</span>
          </h1>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Wallet:</span>
            <span className="font-mono text-slate-700 bg-slate-100 px-3 py-1 rounded-lg text-xs break-all">
              {account}
            </span>
          </div>
        </div>
        <button
          onClick={() => fetchAll(account)}
          disabled={loading}
          className="btn-ghost"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
              Loading
            </>
          ) : (
            <>🔄 Refresh</>
          )}
        </button>
      </div>

      {/* Stats */}
      {!loading && !error && totalAssets > 0 && (
        <div
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8 animate-slide-up"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="card border-2 border-indigo-100">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
              Certificates
            </div>
            <div className="text-3xl font-extrabold text-indigo-600">
              {certs.length}
            </div>
          </div>
          <div className="card border-2 border-purple-100">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
              Soulbound NFTs
            </div>
            <div className="text-3xl font-extrabold text-purple-600">
              {nftCount}
            </div>
          </div>
          <div className="card border-2 border-cyan-100">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
              Credentials
            </div>
            <div className="text-3xl font-extrabold text-cyan-600">
              {govRecords.length}
            </div>
          </div>
          <div className="card border-2 border-amber-100">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
              Land Deeds
            </div>
            <div className="text-3xl font-extrabold text-amber-600">
              {landDeeds.length}
            </div>
          </div>
          <div className="card border-2 border-emerald-100">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
              Health Records
            </div>
            <div className="text-3xl font-extrabold text-emerald-600">
              {healthRecords.length}
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-16 animate-fade-in">
          <div className="inline-block w-14 h-14 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-5 text-slate-600 font-medium">
            Fetching your assets...
          </p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700 flex items-center gap-3 animate-fade-in">
          <span className="text-xl">⚠️</span>
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && totalAssets === 0 && (
        <div className="text-center py-16 card animate-scale-in">
          <div className="text-6xl mb-4 animate-float">📭</div>
          <h2 className="text-2xl font-bold text-slate-700 mb-3">
            No Assets Yet
          </h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            You don't have any certificates, credentials, deeds, or health
            records issued to this wallet
          </p>
          <Link to="/university" className="btn-primary inline-flex">
            📝 Issue a Record
          </Link>
        </div>
      )}

      {/* Education Certificates */}
      {!loading && certs.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2 animate-slide-up">
            🎓 Certificates
            <span className="text-sm font-normal text-slate-500">
              ({certs.length})
            </span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certs.map((cert, i) => (
              <div
                key={cert.certId}
                className="animate-slide-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <CertificateCard
                  cert={cert}
                  onDownload={handleDownload}
                  onViewIPFS={handleViewIPFS}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Government Credentials */}
      {!loading && govRecords.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2 animate-slide-up">
            🆔 Government Credentials
            <span className="text-sm font-normal text-slate-500">
              ({govRecords.length})
            </span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {govRecords.map((cred, i) => (
              <div
                key={cred.id}
                className="animate-slide-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <GovernmentCredentialCard
                  credential={cred}
                  onViewIPFS={() =>
                    window.open(getIPFSUrl(cred.ipfsHash), "_blank")
                  }
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Land Deeds */}
      {!loading && landDeeds.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2 animate-slide-up">
            🏠 Land Deeds
            <span className="text-sm font-normal text-slate-500">
              ({landDeeds.length})
            </span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {landDeeds.map((deed, i) => (
              <div
                key={deed.tokenId}
                className="animate-slide-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <LandDeedCard deed={deed} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Health Records */}
      {!loading && healthRecords.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2 animate-slide-up">
            🏥 Health Records
            <span className="text-sm font-normal text-slate-500">
              ({healthRecords.length})
            </span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {healthRecords.map((record, i) => (
              <div
                key={record.tokenId}
                className="animate-slide-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <HealthRecordCard record={record} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}