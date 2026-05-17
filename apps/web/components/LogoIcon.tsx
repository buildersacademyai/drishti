export function LogoIcon({ size = 40 }: { size?: number }) {
  const h = Math.round(size * 28 / 48);
  return (
    <svg
      viewBox="0 0 48 28"
      width={size}
      height={h}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Drishti logo"
    >
      {/* Eye shape */}
      <path
        d="M2,14 C2,2 46,2 46,14 C46,26 2,26 2,14 Z"
        fill="#1e3a5f"
      />

      {/* Outer lens ring */}
      <circle cx="24" cy="14" r="10" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" />

      {/* Mid lens ring */}
      <circle cx="24" cy="14" r="7" fill="none" stroke="rgba(255,255,255,0.11)" strokeWidth="1" />

      {/* Pupil */}
      <circle cx="24" cy="14" r="4.2" fill="#060e1c" />

      {/* Crosshair ticks — amber, between pupil and outer ring */}
      <line x1="24" y1="9.8"  x2="24" y2="5.5"  stroke="#f59e0b" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="24" y1="18.2" x2="24" y2="22.5" stroke="#f59e0b" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="18.8" y1="14" x2="14.5" y2="14" stroke="#f59e0b" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="29.2" y1="14" x2="33.5" y2="14" stroke="#f59e0b" strokeWidth="1.4" strokeLinecap="round" />

      {/* Center amber reticle dot */}
      <circle cx="24" cy="14" r="1.7" fill="#f59e0b" />

      {/* Catch light */}
      <circle cx="20.5" cy="11" r="1.1" fill="white" fillOpacity="0.42" />

      {/* Eye outline — upper lid slightly heavier, amber tint */}
      <path
        d="M2,14 C2,2 46,2 46,14"
        fill="none"
        stroke="#f59e0b"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeOpacity="0.55"
      />
      <path
        d="M2,14 C2,26 46,26 46,14"
        fill="none"
        stroke="#f59e0b"
        strokeWidth="0.8"
        strokeLinecap="round"
        strokeOpacity="0.3"
      />
    </svg>
  );
}
