export type TipoResultado = "CRAVADA" | "ACERTO_PARCIAL" | "ERRO";

export interface Placar {
  casa: number;
  visitante: number;
}

export interface Pontuacao {
  pontosCravada: number;
  pontosAcerto: number;
}

export interface ResultadoPalpite {
  tipo: TipoResultado;
  pontos: number;
}

function resultadoDoPlacar(p: Placar): "CASA" | "EMPATE" | "VISITANTE" {
  if (p.casa > p.visitante) return "CASA";
  if (p.casa < p.visitante) return "VISITANTE";
  return "EMPATE";
}

export function calcularResultadoPalpite(
  palpite: Placar,
  resultadoFinal: Placar,
  pontuacao: Pontuacao
): ResultadoPalpite {
  if (palpite.casa === resultadoFinal.casa && palpite.visitante === resultadoFinal.visitante) {
    return { tipo: "CRAVADA", pontos: pontuacao.pontosCravada };
  }
  if (resultadoDoPlacar(palpite) === resultadoDoPlacar(resultadoFinal)) {
    return { tipo: "ACERTO_PARCIAL", pontos: pontuacao.pontosAcerto };
  }
  return { tipo: "ERRO", pontos: 0 };
}
