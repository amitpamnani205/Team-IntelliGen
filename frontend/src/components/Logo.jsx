export default function Logo({ size = 36 }) {
  return (
    <div
      className="grid shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#1688F5] to-[#0A4B8C] shadow-lg shadow-blue-900/30"
      style={{ width: size, height: size }}
    >
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none">
        <path d="M12 3L4 9V21L12 15L20 21V9L12 3Z" stroke="white" strokeWidth="1.6" strokeLinejoin="round" fill="rgba(255,255,255,0.12)" />
        <path d="M12 9L8 12V16L12 13L16 16V12L12 9Z" fill="white" />
      </svg>
    </div>
  );
}
