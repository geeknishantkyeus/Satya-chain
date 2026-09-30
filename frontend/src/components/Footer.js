import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="relative border-t border-slate-200 mt-auto bg-white/60 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center text-xl shadow-lg text-white">
                🎓
              </div>
              <span className="text-xl font-extrabold text-slate-900">
                Satya<span className="gradient-text">-Chain</span>
              </span>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              Blockchain-based certificate verification system.
              Fake-proof, instant, and decentralized.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-sm text-slate-900 uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                { to: "/university", label: "Issue Certificate" },
                { to: "/student", label: "My Certificates" },
                { to: "/verify", label: "Verify Certificate" }
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-slate-600 hover:text-indigo-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-sm text-slate-900 uppercase tracking-wider">
              Built With
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                Polygon Amoy Testnet
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></span>
                IPFS via Pinata
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                React + Tailwind
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                Ethers.js
              </li>
            </ul>
          </div>
        </div>

        <div className="divider mb-6"></div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>© 2025 Satya-Chain. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Blockchain & Cybersecurity · SIH
          </p>
        </div>
      </div>
    </footer>
  );
}