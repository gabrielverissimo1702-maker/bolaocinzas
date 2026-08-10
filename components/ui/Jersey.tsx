import { useId } from "react";

const JERSEY_PATH = "M30,10 L40,10 Q50,20 60,10 L70,10 L90,30 L78,42 L78,90 L22,90 L22,42 L10,30 Z";
const NUM_FAIXAS = 8;

type Padrao = "SOLIDO" | "LISTRAS_VERTICAIS" | "LISTRAS_HORIZONTAIS" | "LISTRAS_DIAGONAIS";

export function Jersey({
  cores,
  padraoUniforme,
  sigla,
  size = 40,
  className = "",
}: {
  cores: string[];
  padraoUniforme: Padrao;
  sigla: string;
  size?: number;
  className?: string;
}) {
  const clipId = `jersey-clip-${useId().replace(/[:]/g, "")}`;
  const paleta = cores.length > 0 ? cores : ["#6B7280"];

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-label={sigla}>
      <defs>
        <clipPath id={clipId}>
          <path d={JERSEY_PATH} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        {padraoUniforme === "SOLIDO" && <rect x="0" y="0" width="100" height="100" fill={paleta[0]} />}

        {padraoUniforme === "LISTRAS_VERTICAIS" &&
          Array.from({ length: NUM_FAIXAS }, (_, i) => (
            <rect
              key={i}
              x={(i * 100) / NUM_FAIXAS}
              y="0"
              width={100 / NUM_FAIXAS + 0.5}
              height="100"
              fill={paleta[i % paleta.length]}
            />
          ))}

        {padraoUniforme === "LISTRAS_HORIZONTAIS" &&
          Array.from({ length: NUM_FAIXAS }, (_, i) => (
            <rect
              key={i}
              x="0"
              y={(i * 100) / NUM_FAIXAS}
              width="100"
              height={100 / NUM_FAIXAS + 0.5}
              fill={paleta[i % paleta.length]}
            />
          ))}

        {padraoUniforme === "LISTRAS_DIAGONAIS" && (
          <g transform="rotate(45 50 50)">
            {Array.from({ length: 14 }, (_, i) => (
              <rect key={i} x={-60 + i * 14} y="-60" width="14" height="220" fill={paleta[i % paleta.length]} />
            ))}
          </g>
        )}
      </g>
      <path d={JERSEY_PATH} fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="2" />
      <text
        x="50"
        y="58"
        textAnchor="middle"
        fontSize="22"
        fontWeight="800"
        fill="white"
        stroke="rgba(0,0,0,0.4)"
        strokeWidth="2"
        paintOrder="stroke"
      >
        {sigla}
      </text>
    </svg>
  );
}
