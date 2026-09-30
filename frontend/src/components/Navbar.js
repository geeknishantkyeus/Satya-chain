import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  connectWallet,
  getCurrentAccount,
  disconnectWallet,
} from "../utils/wallet";

export default function Navbar() {
  const [account, setAccount] = useState("");
  const [loading, setLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const manuallyDisconnected = localStorage.getItem("wallet_disconnected");
    if (!manuallyDisconnected) {
      getCurrentAccount().then((addr) => {
        if (addr) setAccount(addr);
      });
    }

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts && accounts.length > 0) {
          setAccount(accounts[0]);
          localStorage.removeItem("wallet_disconnected");
        } else {
          setAccount("");
        }
      });
    }

    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleConnect() {
    try {
      setLoading(true);
      localStorage.removeItem("wallet_disconnected");
      const { address } = await connectWallet();
      setAccount(address);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDisconnect() {
    try {
      await disconnectWallet();
      setAccount("");
      setDropdownOpen(false);
      setTimeout(() => window.location.reload(), 300);
    } catch (error) {
      console.error("Disconnect failed:", error);
      setAccount("");
      setDropdownOpen(false);
      localStorage.setItem("wallet_disconnected", "true");
    }
  }

  function handleCopyAddress() {
    navigator.clipboard.writeText(account);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleViewOnExplorer() {
    window.open(`https://amoy.polygonscan.com/address/${account}`, "_blank");
  }

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/university", label: "Organisation" },
    { to: "/student", label: "Record" },
    { to: "/verify", label: "Verify" },
  ];

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
          ? "bg-white/85 backdrop-blur-xl border-b border-slate-200 shadow-sm"
          : "bg-transparent border-b border-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center flex-wrap gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl blur-md opacity-60 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative w-10 h-10 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center text-xl shadow-lg text-white">
              🎓
            </div>
          </div>
          <span className="text-xl font-extrabold text-slate-900">
            Satya<span className="gradient-text">-Chain</span>
          </span>
        </Link>

        {/* Links + Button */}
        <div className="flex gap-2 items-center flex-wrap">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`relative px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${isActive(link.to)
                  ? "text-indigo-600 bg-indigo-50"
                  : "text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50"
                }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Wallet Button — with Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() =>
                account ? setDropdownOpen(!dropdownOpen) : handleConnect()
              }
              disabled={loading}
              className={`relative px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 shadow-md hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed flex items-center gap-2 ${account
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/30"
                  : "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-indigo-500/30"
                }`}
            >
              {loading ? (
                <>
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Connecting
                </>
              ) : account ? (
                <>
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  <span className="font-mono">
                    {account.slice(0, 6)}...{account.slice(-4)}
                  </span>
                  <svg
                    className={`w-3 h-3 transition-transform ${dropdownOpen ? "rotate-180" : ""
                      }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </>
              ) : (
                "Connect Wallet"
              )}
            </button>

            {/* Dropdown Menu */}
            {account && dropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-scale-in z-50">
                {/* Header */}
                <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-cyan-50 border-b border-slate-100">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Connected
                    </span>
                  </div>
                  <div className="font-mono text-sm text-slate-900 break-all">
                    {account}
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                  <button
                    onClick={handleCopyAddress}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors text-left group"
                  >
                    <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-sm group-hover:bg-indigo-100 transition-colors">
                      {copied ? "✅" : "📋"}
                    </span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-900">
                        {copied ? "Copied!" : "Copy Address"}
                      </div>
                      <div className="text-xs text-slate-500">
                        {copied
                          ? "Address copied to clipboard"
                          : "Copy wallet address"}
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={handleViewOnExplorer}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors text-left group"
                  >
                    <span className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center text-sm group-hover:bg-cyan-100 transition-colors">
                      🔗
                    </span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-900">
                        View on Explorer
                      </div>
                      <div className="text-xs text-slate-500">
                        Open in PolygonScan
                      </div>
                    </div>
                  </button>

                  <div className="h-px bg-slate-100 my-1"></div>

                  <button
                    onClick={handleDisconnect}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-rose-50 transition-colors text-left group"
                  >
                    <span className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-sm group-hover:bg-rose-100 transition-colors">
                      🚪
                    </span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-rose-600">
                        Disconnect
                      </div>
                      <div className="text-xs text-slate-500">
                        Disconnect from this site
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}