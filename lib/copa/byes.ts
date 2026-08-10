export interface ByesInfo {
  /** Maior potência de 2 <= N — tamanho da primeira fase "oficial" do chaveamento. */
  P: number;
  /** Quantos participantes jogam a fase preliminar (sempre um número par). */
  numPreliminar: number;
  /** Quantos participantes recebem bye direto pra fase oficial. */
  numByes: number;
}

export function calcularByes(n: number): ByesInfo {
  if (n < 2) throw new Error("Copa requer ao menos 2 participantes");

  const P = 2 ** Math.floor(Math.log2(n));
  const numPreliminar = 2 * (n - P);
  const numByes = n - numPreliminar;

  return { P, numPreliminar, numByes };
}

const NOMES_FASE: Record<number, string> = {
  2: "Final",
  4: "Semifinal",
  8: "Quartas de Final",
  16: "Oitavas de Final",
  32: "16-avos de Final",
  64: "32-avos de Final",
};

export function nomeDaFase(numeroParticipantesNaFase: number): string {
  return NOMES_FASE[numeroParticipantesNaFase] ?? `Fase de ${numeroParticipantesNaFase}`;
}
