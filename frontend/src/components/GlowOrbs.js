export default function GlowOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div
        className="glow-orb absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full filter blur-3xl opacity-40 animate-float"
        style={{ background: "radial-gradient(circle, #c7d2fe, transparent 70%)" }}
      />
      <div
        className="glow-orb absolute -top-20 -right-20 w-[600px] h-[600px] rounded-full filter blur-3xl opacity-30 animate-float"
        style={{
          background: "radial-gradient(circle, #a5f3fc, transparent 70%)",
          animationDelay: "2s"
        }}
      />
      <div
        className="glow-orb absolute -bottom-40 left-1/3 w-[700px] h-[700px] rounded-full filter blur-3xl opacity-25 animate-float"
        style={{
          background: "radial-gradient(circle, #ddd6fe, transparent 70%)",
          animationDelay: "4s"
        }}
      />
    </div>
  );
}