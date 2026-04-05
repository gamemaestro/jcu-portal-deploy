interface JcuLogoProps {
  size?: number;
  className?: string;
}

export function JcuLogo({ size = 32, className = "" }: JcuLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Jacks Cinema Universe"
      className={className}
    >
      {/* Outer circle */}
      <circle cx="16" cy="16" r="14" strokeWidth="0.75" />

      {/* Inner diamond (rhombus) */}
      <polygon
        points="16,5 24,16 16,27 8,16"
        strokeWidth="0.75"
      />

      {/* Vertical center line */}
      <line x1="16" y1="2" x2="16" y2="30" strokeWidth="0.5" strokeOpacity="0.5" />

      {/* Cardinal dots */}
      <circle cx="16" cy="2" r="1" fill="currentColor" stroke="none" />
      <circle cx="30" cy="16" r="1" fill="currentColor" stroke="none" />
      <circle cx="16" cy="30" r="1" fill="currentColor" stroke="none" />
      <circle cx="2" cy="16" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
