export interface ItemComprovante {
  timeCasa: string;
  timeVisitante: string;
  placarCasa: number;
  placarVisitante: number;
}

// Envio de email ainda não configurado (decisão pendente de provedor — Resend/SMTP).
// Por enquanto só loga no servidor; a assinatura já está pronta pra plugar o envio real depois.
export async function enviarComprovantePalpites(
  usuario: { nome: string; email: string },
  etapaNome: string,
  itens: ItemComprovante[]
): Promise<void> {
  console.log(
    `[email stub] comprovante de palpites para ${usuario.email} (${etapaNome}):`,
    itens.map((i) => `${i.timeCasa} ${i.placarCasa}x${i.placarVisitante} ${i.timeVisitante}`).join(", ")
  );
}
