import { useMemo } from "react";
import { Link } from "react-router-dom";
import AnimatedCounter from "../components/AnimatedCounter";

export default function Home() {
  const qrPattern = useMemo(() => {
    return Array.from({ length: 64 }).map(() => Math.random() > 0.5);
  }, []);

  const features = [
    {
      icon: "🛡️",
      title: "Fake-Proof",
      desc: "Blockchain immutable hai — koi badal nahi sakta",
      color: "from-indigo-500 to-purple-600"
    },
    {
      icon: "⚡",
      title: "2 Second Verify",
      desc: "QR scan karo, instant result pao",
      color: "from-amber-400 to-orange-500"
    },
    {
      icon: "🔒",
      title: "Secure",
      desc: "Cryptographic hash-based verification",
      color: "from-emerald-400 to-teal-500"
    },
    {
      icon: "📱",
      title: "QR Scan",
      desc: "Sirf phone se verify karo, kahin bhi",
      color: "from-cyan-400 to-blue-500"
    }
  ];

  const steps = [
    { num: "01", title: "University Issues", desc: "Certificate blockchain par register hoti hai", icon: "🏛️" },
    { num: "02", title: "Student Gets QR", desc: "PDF milta hai embedded QR ke saath", icon: "🎓" },
    { num: "03", title: "Employer Verifies", desc: "QR scan karo, 2 second mein verify", icon: "✅" }
  ];

  const stats = [
    { value: 100, suffix: "%", label: "Fake-Proof" },
    { value: 2, suffix: "s", label: "Verify Time" },
    { value: 0, suffix: "₹", label: "Verify Cost" },
    { value: 24, suffix: "/7", label: "Available" }
  ];

  const tickerItems = [
    "⛓️ Polygon Amoy Testnet",
    "📦 IPFS Storage",
    "🔐 SHA-256 Hashing",
    "⚡ 2-Second Verification",
    "🛡️ Tamper-Proof",
    "🌐 Decentralized",
    "🎓 University Verified"
  ];

  return (
    <div className="overflow-hidden relative">
      {/* ============================================
          HERO — SPLIT LAYOUT
          ============================================ */}
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* LEFT — Text Content */}
          <div className="animate-slide-in-left">
            {/* Live badge */}
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200 mb-6">
              <span className="live-dot"></span>
              <span className="text-sm font-medium text-slate-700">
                Blockchain Network Live
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 mb-6 leading-[1.05] tracking-tight">
              Certificate
              <br />
              Verification
              <br />
              <span className="gradient-text-animated">
                on Blockchain
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-xl leading-relaxed">
              Fake certificates?{" "}
              <span className="font-bold text-slate-900">Not anymore.</span>
              <br />
              Issue, verify, and trust — in just 2 seconds.
            </p>

            <div className="flex gap-4 flex-wrap mb-10">
              <Link
                to="/university"
                className="btn-primary text-base px-7 py-3.5"
              >
                <span>📝</span> Issue Certificate
              </Link>
              <Link
                to="/verify"
                className="btn-ghost text-base px-7 py-3.5"
              >
                <span>🔍</span> Verify Now
              </Link>
            </div>

            {/* Mini trust indicators */}
            <div className="flex gap-6 flex-wrap text-sm text-slate-500">
              {["Polygon Network", "IPFS Storage", "Decentralized"].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* RIGHT — Visual / Illustration */}
          <div className="relative animate-slide-in-right">
            {/* Decorative blobs */}
            <div className="absolute -top-10 -right-10 w-72 h-72 bg-indigo-200 rounded-full filter blur-3xl opacity-50 animate-float"></div>
            <div
              className="absolute -bottom-10 -left-10 w-72 h-72 bg-cyan-200 rounded-full filter blur-3xl opacity-50 animate-float"
              style={{ animationDelay: "2s" }}
            ></div>

            {/* Main certificate card mockup */}
            <div className="relative card p-8 rotate-2 hover:rotate-0 transition-transform duration-500">
              {/* Certificate mockup */}
              <div className="bg-gradient-to-br from-indigo-50 to-cyan-50 rounded-xl p-6 border border-indigo-100">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-lg flex items-center justify-center text-sm text-white">
                      🎓
                    </div>
                    <div className="text-xs font-bold text-slate-700">
                      CERTIFICATE
                    </div>
                  </div>
                  <span className="badge-success">
                    ✓ Verified
                  </span>
                </div>

                <div className="text-center mb-6">
                  <div className="text-xs text-slate-500 mb-1">
                    This is to certify that
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 mb-1">
                    Rahul Sharma
                  </div>
                  <div className="h-0.5 w-24 mx-auto bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full mb-3"></div>
                  <div className="text-xs text-slate-500 mb-1">
                    has completed
                  </div>
                  <div className="text-sm font-bold text-indigo-600">
                    B.Tech Computer Science
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div className="text-xs text-slate-500">
                    <div className="font-mono">ID: 2024-001</div>
                    <div>Sept 2025</div>
                  </div>
                  <div className="w-16 h-16 bg-white rounded-lg p-1 border border-slate-200">
                    <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-700 rounded grid grid-cols-8 grid-rows-8 gap-0.5 p-1">
                      {qrPattern.map((isFilled, i) => (
                        <div
                          key={i}
                          className={`rounded-sm ${
                            isFilled ? "bg-white" : "bg-transparent"
                          }`}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badge - blockchain */}
              <div
                className="absolute -top-4 -left-4 glass-card px-4 py-2 rounded-xl flex items-center gap-2 animate-float"
                style={{ animationDelay: "1s" }}
              >
                <span className="text-lg">⛓️</span>
                <span className="text-xs font-bold text-slate-700">
                  On-chain
                </span>
              </div>

              {/* Floating badge - IPFS */}
              <div
                className="absolute -bottom-4 -right-4 glass-card px-4 py-2 rounded-xl flex items-center gap-2 animate-float"
                style={{ animationDelay: "3s" }}
              >
                <span className="text-lg">📦</span>
                <span className="text-xs font-bold text-slate-700">
                  IPFS
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================
          TICKER
          ============================================ */}
      <div className="py-5 border-y border-slate-200 bg-white/50 overflow-hidden">
        <div className="marquee">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span
              key={i}
              className="text-sm font-medium text-slate-500 whitespace-nowrap flex items-center gap-2"
            >
              {item}
              <span className="text-indigo-400">•</span>
            </span>
          ))}
        </div>
      </div>

      {/* ============================================
          STATS
          ============================================ */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div              key={i}
              className="card text-center animate-slide-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="text-4xl md:text-5xl font-extrabold gradient-text mb-2">
                <AnimatedCounter
                  end={stat.value}
                  suffix={stat.suffix}
                  duration={2000}
                />
              </div>
              <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================
          FEATURES
          ============================================ */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-indigo-600 mb-3 uppercase tracking-widest">
            Features
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Why <span className="gradient-text">Satya-Chain</span>?
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Built for the future of digital credentials
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="group card tilt-card hover:-translate-y-2 animate-slide-up cursor-default relative overflow-hidden"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-white to-slate-50 flex items-center justify-center text-2xl mb-5 shadow-md border border-slate-100 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${f.color} opacity-10 group-hover:opacity-20 transition-opacity`}
                ></div>
                <span className="relative">{f.icon}</span>
              </div>
              <h3 className="font-bold text-lg mb-2 text-slate-900">
                {f.title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================
          HOW IT WORKS
          ============================================ */}
      <div className="relative py-24 px-6 overflow-hidden bg-gradient-to-b from-white to-slate-50">
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-cyan-600 mb-3 uppercase tracking-widest">
              Workflow
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-600">
              Three simple steps to trust
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-transparent via-indigo-200 to-transparent"></div>

            {steps.map((s, i) => (
              <div
                key={i}
                className="relative text-center animate-slide-up"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className="relative w-32 h-32 mx-auto mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-cyan-400 rounded-full blur-2xl opacity-20 animate-pulse-slow"></div>
                  <div className="relative w-full h-full bg-white rounded-full flex items-center justify-center border border-slate-200 shadow-xl">
                    <span className="text-5xl">{s.icon}</span>
                    <span className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-br from-indigo-500 to-cyan-500 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-lg">
                      {s.num}
                    </span>
                  </div>
                </div>
                <h3 className="font-bold text-xl mb-3 text-slate-900">
                  {s.title}
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm px-4">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================
          CTA
          ============================================ */}
      <div className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative card-accent text-center p-12 md:p-16 overflow-hidden animate-scale-in">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-300 rounded-full filter blur-3xl opacity-30"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-300 rounded-full filter blur-3xl opacity-30"></div>

            <div className="relative">
              <div className="text-6xl mb-6 animate-float">🚀</div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Ready to try it?
              </h2>
              <p className="text-lg text-slate-600 mb-8 max-w-lg mx-auto">
                Issue your first blockchain certificate in seconds
              </p>
              <Link
                to="/university"
                className="btn-primary text-base px-8 py-4"
              >
                Get Started <span className="ml-1">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}