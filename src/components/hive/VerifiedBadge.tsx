// SVG NFT-style badge. Exportable.
export function VerifiedBadge({ name, score, depth, trust, id }: { name: string; score: number; depth: string; trust: string; id?: string }) {
  const tier = score >= 85 ? "GOLD" : score >= 70 ? "SILVER" : "BRONZE";
  const tierColor = tier === "GOLD" ? "#fbbf24" : tier === "SILVER" ? "#cbd5e1" : "#f59e0b";
  return (
    <svg viewBox="0 0 320 420" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1a0a3e" />
          <stop offset="50%" stopColor="#0a1a4a" />
          <stop offset="100%" stopColor="#001a3a" />
        </linearGradient>
        <linearGradient id="glow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="50%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <radialGradient id="halo" cx="50%" cy="35%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="320" height="420" rx="20" fill="url(#bg)" />
      <rect width="320" height="420" rx="20" fill="url(#halo)" />
      <rect x="6" y="6" width="308" height="408" rx="16" fill="none" stroke="url(#glow)" strokeWidth="2" />
      <text x="160" y="48" textAnchor="middle" fill="#94a3b8" fontFamily="monospace" fontSize="10" letterSpacing="3">HIVEX VERIFIED</text>
      <polygon points="160,80 200,103 200,150 160,173 120,150 120,103" fill="none" stroke="url(#glow)" strokeWidth="2.5" />
      <polygon points="160,90 192,108 192,145 160,163 128,145 128,108" fill="url(#glow)" opacity="0.18" />
      <text x="160" y="135" textAnchor="middle" fill="url(#glow)" fontFamily="sans-serif" fontWeight="700" fontSize="36">{score}</text>
      <text x="160" y="200" textAnchor="middle" fill="#fff" fontFamily="sans-serif" fontWeight="700" fontSize="18">{name}</text>
      <text x="160" y="222" textAnchor="middle" fill="#94a3b8" fontFamily="sans-serif" fontSize="11">{depth} · {trust}</text>
      <rect x="100" y="248" width="120" height="28" rx="14" fill={tierColor} fillOpacity="0.15" stroke={tierColor} strokeWidth="1" />
      <text x="160" y="266" textAnchor="middle" fill={tierColor} fontFamily="monospace" fontSize="12" letterSpacing="3">{tier} TIER</text>
      <g transform="translate(40,310)">
        <line x1="0" y1="0" x2="240" y2="0" stroke="#1e293b" strokeWidth="1" />
        <text x="0" y="22" fill="#64748b" fontFamily="monospace" fontSize="9">ID</text>
        <text x="240" y="22" textAnchor="end" fill="#94a3b8" fontFamily="monospace" fontSize="9">{(id ?? Math.random().toString(36).slice(2, 10)).toUpperCase()}</text>
        <text x="0" y="42" fill="#64748b" fontFamily="monospace" fontSize="9">ISSUED</text>
        <text x="240" y="42" textAnchor="end" fill="#94a3b8" fontFamily="monospace" fontSize="9">{new Date().toISOString().slice(0, 10)}</text>
      </g>
      <text x="160" y="395" textAnchor="middle" fill="#475569" fontFamily="monospace" fontSize="9">⚡ hivex.ai/verify</text>
    </svg>
  );
}

export function downloadBadgeSvg(svg: SVGSVGElement, filename: string) {
  const data = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([data], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
